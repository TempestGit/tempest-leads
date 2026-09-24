import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generateCompanyCode from "../../utils/companyCode.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createCompany,
  findCompanyById,
  findCompanyByName,
  getCompanyDependencies,
  listCompanies,
  softDeleteCompany,
  updateCompany,
  updateCompanyCode,
} from "./companies.repository.js";

/*
|--------------------------------------------------------------------------
| List Companies
|--------------------------------------------------------------------------
*/

export const getCompaniesService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listCompanies({
        ...filters,

        userId:
          currentUser.id,

        role:
          currentUser.role,
      });

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total /
              filters.limit
          );

    return {
      companies: rows,

      pagination: {
        page:
          filters.page,

        limit:
          filters.limit,

        total,

        totalPages,
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Get Company
|--------------------------------------------------------------------------
*/

export const getCompanyService =
  async (companyId) => {
    const company =
      await findCompanyById(
        companyId
      );

    if (!company) {
      throw new ApiError(
        404,
        "Company not found.",
        [],
        "COMPANY_NOT_FOUND"
      );
    }

    return company;
  };

/*
|--------------------------------------------------------------------------
| Create Company
|--------------------------------------------------------------------------
*/

export const createCompanyService =
  async ({
    data,
    userId,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Duplicate Check
      |--------------------------------------------------------------------------
      */

      const duplicate =
        await findCompanyByName(
          data.name,
          null,
          connection
        );

      if (duplicate) {
        throw new ApiError(
          409,
          "Possible existing company found.",
          [],
          "COMPANY_ALREADY_EXISTS"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Create
      |--------------------------------------------------------------------------
      */

      const companyId =
        await createCompany(
          {
            ...data,

            country:
              "India",

            source:
              "Other",

            status:
              "ACTIVE",

            userId,
          },

          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Generate CMP-1001
      |--------------------------------------------------------------------------
      */

      const companyCode =
        generateCompanyCode(
          companyId
        );

      const codeUpdated =
        await updateCompanyCode(
          companyId,
          companyCode,
          connection
        );

      if (!codeUpdated) {
        throw new ApiError(
          500,
          "Unable to generate company code.",
          [],
          "COMPANY_CODE_GENERATION_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const company =
        await findCompanyById(
          companyId,
          connection
        );

      if (!company) {
        throw new ApiError(
          500,
          "Company was created but could not be loaded.",
          [],
          "COMPANY_CREATED_BUT_NOT_LOADED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          userId,

        entityType:
          "COMPANY",

        entityId:
          companyId,

        action:
          "COMPANY_CREATED",

        previousValues:
          null,

        newValues:
          company,

        metadata: {
          companyCode,
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return company;
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback error.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Update Company
|--------------------------------------------------------------------------
*/

export const updateCompanyService =
  async ({
    companyId,
    data,
    userId,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findCompanyById(
          companyId,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Company not found.",
          [],
          "COMPANY_NOT_FOUND"
        );
      }

      if (
        data.name !==
          undefined &&
        data.name.toLowerCase() !==
          existing.name.toLowerCase()
      ) {
        const duplicate =
          await findCompanyByName(
            data.name,
            companyId,
            connection
          );

        if (duplicate) {
          throw new ApiError(
            409,
            "Possible existing company found.",
            [],
            "COMPANY_ALREADY_EXISTS"
          );
        }
      }

      await updateCompany(
        companyId,
        data,
        userId,
        connection
      );

      const updated =
        await findCompanyById(
          companyId,
          connection
        );

      if (!updated) {
        throw new ApiError(
          500,
          "Company was updated but could not be loaded.",
          [],
          "COMPANY_UPDATED_BUT_NOT_LOADED"
        );
      }

      await createAuditLog({
        actorUserId:
          userId,

        entityType:
          "COMPANY",

        entityId:
          companyId,

        action:
          "COMPANY_UPDATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          changedFields:
            Object.keys(
              data
            ),
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return updated;
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback error.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Delete Company
|--------------------------------------------------------------------------
*/

export const deleteCompanyService =
  async ({
    companyId,
    userId,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findCompanyById(
          companyId,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Company not found.",
          [],
          "COMPANY_NOT_FOUND"
        );
      }

      const dependencies =
        await getCompanyDependencies(
          companyId,
          connection
        );

      if (
        dependencies.contacts >
          0 ||
        dependencies.leads >
          0
      ) {
        throw new ApiError(
          409,
          "Company cannot be deleted because it has related contacts or leads.",
          [],
          "COMPANY_IN_USE"
        );
      }

      const deleted =
        await softDeleteCompany(
          companyId,
          userId,
          connection
        );

      if (!deleted) {
        throw new ApiError(
          404,
          "Company not found.",
          [],
          "COMPANY_NOT_FOUND"
        );
      }

      await createAuditLog({
        actorUserId:
          userId,

        entityType:
          "COMPANY",

        entityId:
          companyId,

        action:
          "COMPANY_DELETED",

        previousValues:
          existing,

        newValues:
          null,

        metadata: {
          deletionType:
            "SOFT_DELETE",
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return true;
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback error.
      }

      throw error;
    } finally {
      connection.release();
    }
  };