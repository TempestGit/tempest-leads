
import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  sendNewUserCredentialsEmail,
} from "../../services/mail.service.js";

import {
  countOwnedLeadsOutsideBranch,
  findActiveSuperAdmin,
  findBranchById,
  findUserByEmail,
  findUserById,
  insertUser,
  listActiveBranches,
  listUsers,
  reassignOwnedLeads,
  setUserStatus,
  updateUserCode,
  updateUserDetails,
} from "./users.repository.js";

/*
|--------------------------------------------------------------------------
| Password Configuration
|--------------------------------------------------------------------------
*/

const PASSWORD_SALT_ROUNDS = 12;

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
*/

const hashPassword = async (password) => {
  return bcrypt.hash(
    password,
    PASSWORD_SALT_ROUNDS
  );
};

/*
|--------------------------------------------------------------------------
| Generate Strong Temporary Password
|--------------------------------------------------------------------------
|
| Password is generated securely on the backend.
|
| - 32 characters
| - Cryptographically secure
| - Uses Node.js crypto
| - Meets existing 8–128 character validation
| - Never returned through API
| - Never stored as plaintext
|
|--------------------------------------------------------------------------
*/

const generateStrongPassword = () => {
  return crypto
    .randomBytes(24)
    .toString("base64url");
};

/*
|--------------------------------------------------------------------------
| Super Admin Check
|--------------------------------------------------------------------------
*/

const requireSuperAdmin = (currentUser) => {
  if (
    currentUser?.role !== "SUPER_ADMIN"
  ) {
    throw new ApiError(
      403,
      "Only Super Admin can manage users.",
      [],
      "FORBIDDEN"
    );
  }
};

/*
|--------------------------------------------------------------------------
| Resolve Branch
|--------------------------------------------------------------------------
*/

const resolveBranch = async (
  role,
  branchId,
  connection
) => {
  /*
   * Super Admin has global access
   * and does not require a branch.
   */

  if (role === "SUPER_ADMIN") {
    return null;
  }

  /*
   * Owner must have a branch.
   */

  if (!branchId) {
    throw new ApiError(
      422,
      "Branch is required for an Owner.",
      [],
      "USER_BRANCH_REQUIRED"
    );
  }

  const branch = await findBranchById(
    branchId,
    connection
  );

  if (!branch) {
    throw new ApiError(
      404,
      "Selected branch was not found or is inactive.",
      [],
      "BRANCH_NOT_FOUND"
    );
  }

  return branch.id;
};

/*
|--------------------------------------------------------------------------
| Safe Transaction Rollback
|--------------------------------------------------------------------------
*/

const rollbackSafely = async (connection) => {
  try {
    await connection.rollback();
  } catch {
    // Preserve the original error.
  }
};

/*
|--------------------------------------------------------------------------
| User Options
|--------------------------------------------------------------------------
*/

export const getUserOptionsService = async (
  currentUser
) => {
  requireSuperAdmin(currentUser);

  return {
    branches: await listActiveBranches(),

    roles: [
      {
        value: "OWNER",
        label: "User / Owner",
      },
      {
        value: "SUPER_ADMIN",
        label: "Super Admin",
      },
    ],

    statuses: [
      {
        value: "ACTIVE",
        label: "Active",
      },
      {
        value: "INACTIVE",
        label: "Inactive",
      },
    ],
  };
};

/*
|--------------------------------------------------------------------------
| List Users
|--------------------------------------------------------------------------
*/

export const listUsersService = async (
  query,
  currentUser
) => {
  requireSuperAdmin(currentUser);

  const users = await listUsers(query);

  return {
    users,
  };
};

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
|
| 1. Verify Super Admin.
| 2. Check duplicate email.
| 3. Validate branch.
| 4. Generate secure temporary password.
| 5. Hash password using bcrypt.
| 6. Insert user into MySQL.
| 7. Generate user code.
| 8. Create audit log.
| 9. Commit database transaction.
| 10. Send original temporary password via Resend.
|
| Important:
| Email is sent AFTER transaction commit.
|
| If Resend fails, the created user remains saved.
| The response reports emailSent: false.
|
|--------------------------------------------------------------------------
*/

export const createUserService = async ({
  data,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  requireSuperAdmin(currentUser);

  /*
  |--------------------------------------------------------------------------
  | Normalize Email
  |--------------------------------------------------------------------------
  */

  const email = data.email
    .trim()
    .toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | Generate Password
  |--------------------------------------------------------------------------
  */

  const temporaryPassword =
    generateStrongPassword();

  const passwordHash =
    await hashPassword(
      temporaryPassword
    );

  /*
  |--------------------------------------------------------------------------
  | Database Connection
  |--------------------------------------------------------------------------
  */

  const connection =
    await pool.getConnection();

  let createdUser = null;

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Duplicate Email
    |--------------------------------------------------------------------------
    */

    const existingEmail =
      await findUserByEmail(
        email,
        connection
      );

    if (existingEmail) {
      throw new ApiError(
        409,
        "A user with this email already exists.",
        [],
        "EMAIL_ALREADY_EXISTS"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Branch
    |--------------------------------------------------------------------------
    */

    const branchId =
      await resolveBranch(
        data.role,
        data.branchId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Insert User
    |--------------------------------------------------------------------------
    */

    const userId =
      await insertUser(
        {
          fullName: data.fullName,

          email,

          passwordHash,

          role: data.role,

          department:
            data.department,

          location:
            data.location,

          branchId,
        },
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Generate User Code
    |--------------------------------------------------------------------------
    */

    const userCode =
      `USR-${1000 + userId}`;

    await updateUserCode(
      userId,
      userCode,
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Load Created User
    |--------------------------------------------------------------------------
    */

    createdUser =
      await findUserById(
        userId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Audit Log
    |--------------------------------------------------------------------------
    |
    | Do not include plaintext password
    | in audit logs.
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId:
        currentUser.id,

      entityType:
        "USER",

      entityId:
        userId,

      action:
        "USER_CREATED",

      previousValues:
        null,

      newValues:
        createdUser,

      metadata: {
        branchId,

        passwordGenerated:
          true,

        emailProvider:
          "RESEND",
      },

      ipAddress,

      userAgent,

      connection,
    });

    /*
    |--------------------------------------------------------------------------
    | Commit Transaction
    |--------------------------------------------------------------------------
    */

    await connection.commit();

  } catch (error) {
    await rollbackSafely(connection);

    throw error;

  } finally {
    connection.release();
  }

  /*
  |--------------------------------------------------------------------------
  | Send Welcome Email Using Resend
  |--------------------------------------------------------------------------
  |
  | Send only after successful database commit.
  |
  | Resend receives the original temporary password.
  | The database stores only the bcrypt hash.
  |
  | If email sending fails, do not undo user creation.
  |
  |--------------------------------------------------------------------------
  */

  let emailSent = false;

  try {
    await sendNewUserCredentialsEmail({
      fullName:
        createdUser.fullName,

      email:
        createdUser.email,

      password:
        temporaryPassword,

      role:
        createdUser.role,
    });

    emailSent = true;

  } catch (error) {
    /*
     * Never log temporary passwords,
     * email contents or API keys.
     */

    console.error(
      "Failed to send user credentials email:",
      {
        userId:
          createdUser.id,

        provider:
          "RESEND",

        errorCode:
          error?.code ||
          "EMAIL_SEND_FAILED",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Return Safe Response
  |--------------------------------------------------------------------------
  |
  | Never return temporaryPassword
  | or passwordHash.
  |
  |--------------------------------------------------------------------------
  */

  return {
    user: createdUser,

    emailSent,
  };
};

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
|
| Preserve:
| - Full name
| - Email
| - Role
| - Department
| - Location
| - Branch
| - Duplicate email validation
| - Owned lead branch validation
| - Audit logging
|
| Manual password editing is disabled.
|
|--------------------------------------------------------------------------
*/

export const updateUserService = async ({
  userId,
  data,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  requireSuperAdmin(currentUser);

  /*
  |--------------------------------------------------------------------------
  | Prevent Manual Password Assignment
  |--------------------------------------------------------------------------
  */

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "password"
    )
  ) {
    throw new ApiError(
      422,
      "Passwords cannot be assigned manually from User Management.",
      [],
      "MANUAL_PASSWORD_NOT_ALLOWED"
    );
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Existing User
    |--------------------------------------------------------------------------
    */

    const existing =
      await findUserById(
        userId,
        connection
      );

    if (!existing) {
      throw new ApiError(
        404,
        "User not found.",
        [],
        "USER_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve Values
    |--------------------------------------------------------------------------
    */

    const fullName =
      data.fullName ??
      existing.fullName;

    const email =
      data.email !== undefined
        ? data.email.trim().toLowerCase()
        : existing.email;

    const role =
      data.role ??
      existing.role;

    const department =
      data.department !== undefined
        ? data.department
        : existing.department;

    const location =
      data.location !== undefined
        ? data.location
        : existing.location;

    const requestedBranchId =
      data.branchId !== undefined
        ? data.branchId
        : existing.branchId;

    /*
    |--------------------------------------------------------------------------
    | Resolve Branch
    |--------------------------------------------------------------------------
    */

    const branchId =
      await resolveBranch(
        role,
        requestedBranchId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Duplicate Email
    |--------------------------------------------------------------------------
    */

    if (
      email.toLowerCase() !==
      existing.email.toLowerCase()
    ) {
      const duplicate =
        await findUserByEmail(
          email,
          connection
        );

      if (
        duplicate &&
        Number(duplicate.id) !==
          Number(userId)
      ) {
        throw new ApiError(
          409,
          "A user with this email already exists.",
          [],
          "EMAIL_ALREADY_EXISTS"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Existing Lead Branch
    |--------------------------------------------------------------------------
    */

    if (role === "OWNER") {
      const outsideBranch =
        await countOwnedLeadsOutsideBranch(
          userId,
          branchId,
          connection
        );

      if (outsideBranch > 0) {
        throw new ApiError(
          409,
          `${outsideBranch} owned lead(s) belong to another branch. Reassign those leads before changing this user's branch.`,
          [],
          "USER_BRANCH_HAS_LEADS"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Details
    |--------------------------------------------------------------------------
    */

    await updateUserDetails(
      userId,
      {
        fullName,

        email,

        role,

        department,

        location,

        branchId,
      },
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Reload User
    |--------------------------------------------------------------------------
    */

    const updated =
      await findUserById(
        userId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Audit Log
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId:
        currentUser.id,

      entityType:
        "USER",

      entityId:
        userId,

      action:
        "USER_UPDATED",

      previousValues:
        existing,

      newValues:
        updated,

      metadata: {
        branchId,
      },

      ipAddress,

      userAgent,

      connection,
    });

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await connection.commit();

    return updated;

  } catch (error) {
    await rollbackSafely(connection);

    throw error;

  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Update User Status
|--------------------------------------------------------------------------
|
| - Activate user
| - Deactivate user
| - Prevent self-deactivation
| - Reassign owned leads to active Super Admin
| - Preserve audit logging
|
|--------------------------------------------------------------------------
*/

export const updateUserStatusService = async ({
  userId,
  status,
  currentUser,
  ipAddress,
  userAgent,
}) => {
  requireSuperAdmin(currentUser);

  /*
  |--------------------------------------------------------------------------
  | Prevent Self Deactivation
  |--------------------------------------------------------------------------
  */

  if (
    Number(userId) ===
      Number(currentUser.id) &&
    status === "INACTIVE"
  ) {
    throw new ApiError(
      422,
      "You cannot deactivate your own account.",
      [],
      "CANNOT_DEACTIVATE_SELF"
    );
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Existing User
    |--------------------------------------------------------------------------
    */

    const existing =
      await findUserById(
        userId,
        connection
      );

    if (!existing) {
      throw new ApiError(
        404,
        "User not found.",
        [],
        "USER_NOT_FOUND"
      );
    }

    let reassignedLeads = 0;

    /*
    |--------------------------------------------------------------------------
    | Lead Reassignment
    |--------------------------------------------------------------------------
    */

    if (
      status === "INACTIVE" &&
      existing.status !== "INACTIVE"
    ) {
      const superAdmin =
        await findActiveSuperAdmin(
          userId,
          connection
        );

      if (!superAdmin) {
        throw new ApiError(
          422,
          "An active Super Admin is required before this user can be deactivated.",
          [],
          "SUPER_ADMIN_REQUIRED"
        );
      }

      reassignedLeads =
        await reassignOwnedLeads(
          userId,
          superAdmin.id,
          connection
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    await setUserStatus(
      userId,
      status,
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Reload Updated User
    |--------------------------------------------------------------------------
    */

    const updated =
      await findUserById(
        userId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Audit Log
    |--------------------------------------------------------------------------
    */

    await createAuditLog({
      actorUserId:
        currentUser.id,

      entityType:
        "USER",

      entityId:
        userId,

      action:
        status === "ACTIVE"
          ? "USER_ACTIVATED"
          : "USER_DEACTIVATED",

      previousValues: {
        status:
          existing.status,
      },

      newValues: {
        status:
          updated.status,
      },

      metadata: {
        reassignedLeads,
      },

      ipAddress,

      userAgent,

      connection,
    });

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await connection.commit();

    return {
      user: updated,

      reassignedLeads,
    };

  } catch (error) {
    await rollbackSafely(connection);

    throw error;

  } finally {
    connection.release();
  }
};
