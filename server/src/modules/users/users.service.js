import bcrypt from "bcryptjs";

import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

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
  updateUserPassword,
} from "./users.repository.js";

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
*/

const PASSWORD_SALT_ROUNDS =
  12;

const hashPassword =
  async (
    password
  ) => {
    return bcrypt.hash(
      password,
      PASSWORD_SALT_ROUNDS
    );
  };

/*
|--------------------------------------------------------------------------
| Super Admin Check
|--------------------------------------------------------------------------
*/

const requireSuperAdmin =
  (
    currentUser
  ) => {
    if (
      currentUser?.role !==
      "SUPER_ADMIN"
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

const resolveBranch =
  async (
    role,
    branchId,
    connection
  ) => {
    /*
     * Super Admin has global access
     * and does not require a branch.
     */
    if (
      role ===
      "SUPER_ADMIN"
    ) {
      return null;
    }

    /*
     * Owners must have a branch.
     */
    if (!branchId) {
      throw new ApiError(
        422,
        "Branch is required for an Owner.",
        [],
        "USER_BRANCH_REQUIRED"
      );
    }

    const branch =
      await findBranchById(
        branchId,
        connection
      );

    if (!branch) {
      throw new ApiError(
        404,
        "Selected branch was not found.",
        [],
        "BRANCH_NOT_FOUND"
      );
    }

    return branch.id;
  };

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

export const getUserOptionsService =
  async (
    currentUser
  ) => {
    requireSuperAdmin(
      currentUser
    );

    return {
      branches:
        await listActiveBranches(),

      roles: [
        {
          value:
            "OWNER",

          label:
            "User / Owner",
        },

        {
          value:
            "SUPER_ADMIN",

          label:
            "Super Admin",
        },
      ],

      statuses: [
        {
          value:
            "ACTIVE",

          label:
            "Active",
        },

        {
          value:
            "INACTIVE",

          label:
            "Inactive",
        },
      ],
    };
  };

/*
|--------------------------------------------------------------------------
| List Users
|--------------------------------------------------------------------------
*/

export const listUsersService =
  async (
    query,
    currentUser
  ) => {
    requireSuperAdmin(
      currentUser
    );

    const users =
      await listUsers(
        query
      );

    return {
      users,
    };
  };

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

export const createUserService =
  async ({
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    requireSuperAdmin(
      currentUser
    );

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Duplicate Email
      |--------------------------------------------------------------------------
      */

      const existingEmail =
        await findUserByEmail(
          data.email,
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
      | Branch
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
      | Password
      |--------------------------------------------------------------------------
      */

      const passwordHash =
        await hashPassword(
          data.password
        );

      /*
      |--------------------------------------------------------------------------
      | Insert
      |--------------------------------------------------------------------------
      */

      const userId =
        await insertUser(
          {
            fullName:
              data.fullName,

            email:
              data.email,

            passwordHash,

            role:
              data.role,

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
      | User Code
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

      const created =
        await findUserById(
          userId,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
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
          created,

        metadata: {
          branchId,
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return created;
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

export const updateUserService =
  async ({
    userId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    requireSuperAdmin(
      currentUser
    );

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
        data.email ??
        existing.email;

      const role =
        data.role ??
        existing.role;

      const department =
        data.department !==
        undefined
          ? data.department
          : existing.department;

      const location =
        data.location !==
        undefined
          ? data.location
          : existing.location;

      const requestedBranchId =
        data.branchId !==
        undefined
          ? data.branchId
          : existing.branchId;

      /*
      |--------------------------------------------------------------------------
      | Branch
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
          Number(
            duplicate.id
          ) !==
            Number(
              userId
            )
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
      | Existing Lead Branch Validation
      |--------------------------------------------------------------------------
      */

      if (
        role ===
        "OWNER"
      ) {
        const outsideBranch =
          await countOwnedLeadsOutsideBranch(
            userId,
            branchId,
            connection
          );

        if (
          outsideBranch >
          0
        ) {
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
      | Update Password
      |--------------------------------------------------------------------------
      */

      if (
        data.password
      ) {
        const passwordHash =
          await hashPassword(
            data.password
          );

        await updateUserPassword(
          userId,
          passwordHash,
          connection
        );
      }

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
      | Audit
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

      await connection.commit();

      return updated;
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Update User Status
|--------------------------------------------------------------------------
*/

export const updateUserStatusService =
  async ({
    userId,
    status,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    requireSuperAdmin(
      currentUser
    );

    /*
     * Prevent Super Admin from
     * disabling themselves.
     */
    if (
      Number(
        userId
      ) ===
        Number(
          currentUser.id
        ) &&
      status ===
        "INACTIVE"
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

      let reassignedLeads =
        0;

      /*
      |--------------------------------------------------------------------------
      | Lead Reassignment
      |--------------------------------------------------------------------------
      */

      if (
        status ===
          "INACTIVE" &&
        existing.status !==
          "INACTIVE"
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
      | Status
      |--------------------------------------------------------------------------
      */

      await setUserStatus(
        userId,
        status,
        connection
      );

      const updated =
        await findUserById(
          userId,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
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
          status ===
          "ACTIVE"
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

      await connection.commit();

      return {
        user:
          updated,

        reassignedLeads,
      };
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors.
      }

      throw error;
    } finally {
      connection.release();
    }
  };