import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
} from "../activities/activities.repository.js";

import {
  upsertNurtureProfile,
} from "../nurture/nurture.repository.js";

import {
  createCompany,
  findCompanyByName,
  updateCompanyCode,
} from "../companies/companies.repository.js";

import {
  createContact,
  updateContactCode,
} from "../contacts/contacts.repository.js";

import {
  closeLeadState,
  createLeadFollowup,
  createLeadStageHistory,
  findContactForCompany,
  findLeadBranch,
  findLeadById,
  findLeadCompany,
  findLeadOwner,
  insertLead,
  listActiveLeadBranches,
  listAssignableLeadOwners,
  listLeadOptions,
  listLeads,
  updateLead,
  updateLeadOwner,
  updateLeadStage,
} from "./leads.repository.js";

/*
|--------------------------------------------------------------------------
| Follow-up Code
|--------------------------------------------------------------------------
*/

const createFollowupCode =
  () =>
    `FUP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

/*
|--------------------------------------------------------------------------
| Validate Company / Contact
|--------------------------------------------------------------------------
*/

const validateLeadRelations =
  async (
    {
      companyId,
      primaryContactId,
    },
    connection
  ) => {
    const company =
      await findLeadCompany(
        companyId,
        connection
      );

    if (!company) {
      throw new ApiError(
        404,
        "Company not found.",
        [],
        "COMPANY_NOT_FOUND"
      );
    }

    const contact =
      await findContactForCompany(
        primaryContactId,
        companyId,
        connection
      );

    if (!contact) {
      throw new ApiError(
        422,
        "Primary contact does not belong to the selected company.",
        [],
        "INVALID_PRIMARY_CONTACT"
      );
    }

    return {
      company,
      contact,
    };
  };

/*
|--------------------------------------------------------------------------
| Validate Branch
|--------------------------------------------------------------------------
*/

const validateBranch =
  async (
    branchId,
    connection = pool
  ) => {
    if (!branchId) {
      throw new ApiError(
        422,
        "Primary branch is required.",
        [],
        "BRANCH_REQUIRED"
      );
    }

    const branch =
      await findLeadBranch(
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

    return branch;
  };

/*
|--------------------------------------------------------------------------
| Validate Current User Branch Access
|--------------------------------------------------------------------------
|
| Super Admin:
| - May create/manage leads in any active branch.
|
| Owner:
| - May create/manage leads only inside their assigned branch.
|
*/

const validateBranchAccess =
  async (
    currentUser,
    branchId,
    connection = pool
  ) => {
    const branch =
      await validateBranch(
        branchId,
        connection
      );

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role ===
      "SUPER_ADMIN"
    ) {
      return branch;
    }

    /*
    |--------------------------------------------------------------------------
    | Current Owner
    |--------------------------------------------------------------------------
    */

    const currentOwner =
      await findLeadOwner(
        currentUser.id,
        connection
      );

    if (!currentOwner) {
      throw new ApiError(
        404,
        "Current user was not found.",
        [],
        "CURRENT_USER_NOT_FOUND"
      );
    }

    if (
      String(
        currentOwner.status
      ).toUpperCase() !==
      "ACTIVE"
    ) {
      throw new ApiError(
        403,
        "Your user account is inactive.",
        [],
        "USER_INACTIVE"
      );
    }

    if (
      !currentOwner.branchId
    ) {
      throw new ApiError(
        422,
        "Your account does not have a branch assigned.",
        [],
        "USER_BRANCH_REQUIRED"
      );
    }

    if (
      Number(
        currentOwner.branchId
      ) !==
      Number(
        branchId
      )
    ) {
      throw new ApiError(
        403,
        "You cannot manage leads for another branch.",
        [],
        "BRANCH_ACCESS_DENIED"
      );
    }

    return branch;
  };

/*
|--------------------------------------------------------------------------
| Validate Owner
|--------------------------------------------------------------------------
|
| Rules:
|
| 1. Owner must exist.
| 2. Owner must be ACTIVE.
| 3. SUPER_ADMIN is global and may own a lead from any branch.
| 4. Normal OWNER must belong to the lead's primary branch.
|
*/

const validateOwner =
  async (
    ownerId,
    branchId,
    connection = pool
  ) => {
    const owner =
      await findLeadOwner(
        ownerId,
        connection
      );

    if (!owner) {
      throw new ApiError(
        404,
        "Owner not found.",
        [],
        "OWNER_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Active User
    |--------------------------------------------------------------------------
    */

    if (
      String(
        owner.status
      ).toUpperCase() !==
      "ACTIVE"
    ) {
      throw new ApiError(
        422,
        "Selected owner is inactive.",
        [],
        "OWNER_INACTIVE"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    |
    | Super Admin has global access.
    |
    */

    if (
      owner.role ===
      "SUPER_ADMIN"
    ) {
      return owner;
    }

    /*
    |--------------------------------------------------------------------------
    | Owner Must Have Branch
    |--------------------------------------------------------------------------
    */

    if (!owner.branchId) {
      throw new ApiError(
        422,
        "Selected owner does not have a branch assigned.",
        [],
        "OWNER_BRANCH_REQUIRED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Owner Branch Must Match Lead Branch
    |--------------------------------------------------------------------------
    */

    if (
      Number(
        owner.branchId
      ) !==
      Number(
        branchId
      )
    ) {
      throw new ApiError(
        422,
        "Selected owner does not belong to the lead branch.",
        [],
        "OWNER_BRANCH_MISMATCH"
      );
    }

    return owner;
  };

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const getLeadsService =
  async (
    filters,
    currentUser
  ) => {
    const {
      leads,
      total,
    } =
      await listLeads({
        ...filters,

        currentUser,
      });

    return {
      leads,

      pagination: {
        page:
          filters.page,

        limit:
          filters.limit,

        total,

        totalPages:
          total === 0
            ? 0
            : Math.ceil(
                total /
                  filters.limit
              ),
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Lead Options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsService =
  async (
    currentUser
  ) => {
    const leads =
      await listLeadOptions(
        currentUser
      );

    return {
      leads,
    };
  };

/*
|--------------------------------------------------------------------------
| Get One
|--------------------------------------------------------------------------
*/

export const getLeadService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findLeadById(
        leadId,
        currentUser
      );

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found.",
        [],
        "LEAD_NOT_FOUND"
      );
    }

    return lead;
  };

/*
|--------------------------------------------------------------------------
| Create / Resolve Lead Company + Contact
|--------------------------------------------------------------------------
|
| Add Lead captures company and primary contact information directly.
|
| Everything here runs using the SAME MySQL transaction connection used
| when creating the lead.
|
| Flow:
|
| Company
| -> Contact
| -> Lead
| -> Stage History
| -> Activity
| -> Follow-up
| -> Audit
| -> COMMIT
|
| Any error:
|
| -> ROLLBACK
|
*/

const createLeadRelations =
  async (
    data,
    currentUser,
    connection
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Company Input
    |--------------------------------------------------------------------------
    */

    const companyInput =
      data.company;

    if (!companyInput) {
      throw new ApiError(
        422,
        "Company information is required.",
        [],
        "COMPANY_REQUIRED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Company
    |--------------------------------------------------------------------------
    |
    | CRM model:
    |
    | ONE COMPANY
    | -> MANY CONTACTS
    |
    | Therefore, when the exact company name already exists, use that company
    | instead of creating another duplicate company record.
    |
    */

    let company =
      await findCompanyByName(
        companyInput.name,
        null,
        connection
      );

    let companyId;

    let companyCreated =
      false;

    /*
    |--------------------------------------------------------------------------
    | Create Company When Missing
    |--------------------------------------------------------------------------
    */

    if (company) {
      companyId =
        Number(
          company.id
        );
    } else {
      companyId =
        Number(
          await createCompany(
            {
              name:
                companyInput.name,

              industry:
                companyInput.industry,

              city:
                companyInput.city ||
                null,

              website:
                companyInput.website ||
                null,

              agencyRelationship:
                companyInput
                  .agencyRelationship ||
                null,

              country:
                "India",

              source:
                data.source ||
                "Other",

              status:
                "ACTIVE",

              userId:
                currentUser.id,
            },
            connection
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Company Public Code
      |--------------------------------------------------------------------------
      |
      | Database ID:
      |
      | 1
      |
      | Public ID:
      |
      | CMP-1001
      |
      */

      const companyCode =
        `CMP-${1000 + companyId}`;

      const companyCodeUpdated =
        await updateCompanyCode(
          companyId,
          companyCode,
          connection
        );

      if (!companyCodeUpdated) {
        throw new ApiError(
          500,
          "Company was created but its company code could not be generated.",
          [],
          "COMPANY_CODE_UPDATE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Confirm Company
      |--------------------------------------------------------------------------
      */

      company =
        await findLeadCompany(
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

      companyCreated =
        true;
    }

    /*
    |--------------------------------------------------------------------------
    | Primary Contact Input
    |--------------------------------------------------------------------------
    */

    const contactInput =
      data.contact;

    if (!contactInput) {
      throw new ApiError(
        422,
        "Primary contact information is required.",
        [],
        "CONTACT_REQUIRED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Contact
    |--------------------------------------------------------------------------
    |
    | A new contact is created under the selected/resolved company.
    |
    */

    const contactId =
      Number(
        await createContact(
          {
            companyId,

            name:
              contactInput.name,

            designation:
              contactInput.designation ||
              null,

            phone:
              contactInput.phone ||
              null,

            email:
              contactInput.email ||
              null,

            isDecisionMaker:
              Boolean(
                contactInput
                  .isDecisionMaker
              ),

            userId:
              currentUser.id,
          },
          connection
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Contact Public Code
    |--------------------------------------------------------------------------
    |
    | Database ID:
    |
    | 1
    |
    | Public ID:
    |
    | CON-2001
    |
    */

    const contactCode =
      `CON-${2000 + contactId}`;

    const contactCodeUpdated =
      await updateContactCode(
        contactId,
        contactCode,
        connection
      );

    if (!contactCodeUpdated) {
      throw new ApiError(
        500,
        "Contact was created but its contact code could not be generated.",
        [],
        "CONTACT_CODE_UPDATE_FAILED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Confirm Contact Belongs To Company
    |--------------------------------------------------------------------------
    */

    const contact =
      await findContactForCompany(
        contactId,
        companyId,
        connection
      );

    if (!contact) {
      throw new ApiError(
        500,
        "Contact was created but could not be loaded.",
        [],
        "CONTACT_CREATED_BUT_NOT_LOADED"
      );
    }

    return {
      companyId,

      contactId,

      companyCreated,

      companyName:
        companyInput.name,

      contactName:
        contactInput.name,
    };
  };

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export const createLeadService =
  async ({
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      /*
      |--------------------------------------------------------------------------
      | Begin Transaction
      |--------------------------------------------------------------------------
      */

      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Create / Resolve Company + Contact
      |--------------------------------------------------------------------------
      */

      const relations =
        await createLeadRelations(
          data,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Build Lead Data
      |--------------------------------------------------------------------------
      |
      | Frontend submits:
      |
      | company: {...}
      | contact: {...}
      |
      | The database lead row requires:
      |
      | companyId
      | primaryContactId
      |
      | We now have the real MySQL IDs.
      |
      */

      const leadData = {
        ...data,

        companyId:
          relations.companyId,

        primaryContactId:
          relations.contactId,
      };

      /*
      |--------------------------------------------------------------------------
      | Validate Company / Contact
      |--------------------------------------------------------------------------
      */

      await validateLeadRelations(
        {
          companyId:
            leadData.companyId,

          primaryContactId:
            leadData.primaryContactId,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Validate Primary Branch
      |--------------------------------------------------------------------------
      */

      const branch =
        await validateBranchAccess(
          currentUser,
          leadData.branchId,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Validate Owner Against Branch
      |--------------------------------------------------------------------------
      */

      const owner =
        await validateOwner(
          leadData.ownerId,
          branch.id,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Create Lead
      |--------------------------------------------------------------------------
      */

      const {
        leadId,
        leadCode,
      } =
        await insertLead(
          {
            ...leadData,

            branchId:
              branch.id,

            ownerId:
              owner.id,
          },
          currentUser.id,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Initial Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            null,

          newStage:
            "New",

          reason:
            "Lead created.",

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Initial Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Lead created",

          outcome:
            "New lead created",

          notes:
            `Company, primary contact and lead created. Primary branch: ${branch.name}.`,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Initial Follow-up
      |--------------------------------------------------------------------------
      */

      await createLeadFollowup(
        {
          followupCode:
            createFollowupCode(),

          leadId,

          assignedTo:
            owner.id,

          action:
            leadData.nextAction,

          dueAt:
            leadData.followUpAt,

          priority:
            leadData.priority,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload Lead
      |--------------------------------------------------------------------------
      */

      const lead =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!lead) {
        throw new ApiError(
          500,
          "Lead was created but could not be loaded.",
          [],
          "LEAD_CREATED_BUT_NOT_LOADED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_CREATED",

        previousValues:
          null,

        newValues:
          lead,

        metadata: {
          leadCode,

          companyId:
            relations.companyId,

          companyName:
            relations.companyName,

          companyCreated:
            relations.companyCreated,

          primaryContactId:
            relations.contactId,

          contactName:
            relations.contactName,

          branchId:
            branch.id,

          branchName:
            branch.name,

          ownerId:
            owner.id,

          ownerName:
            owner.fullName,
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

      return lead;
    } catch (
      error
    ) {
      /*
      |--------------------------------------------------------------------------
      | Rollback Everything
      |--------------------------------------------------------------------------
      |
      | If company succeeds but contact/lead/follow-up/activity fails,
      | the new records created in this transaction are rolled back.
      |
      */

      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLeadService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing Lead
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Company / Contact
      |--------------------------------------------------------------------------
      */

      const companyId =
        data.companyId ??
        existing.companyId;

      const contactId =
        data.primaryContactId ??
        existing.primaryContactId;

      await validateLeadRelations(
        {
          companyId,

          primaryContactId:
            contactId,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Validate Branch Change
      |--------------------------------------------------------------------------
      |
      | Branch validation is required only when branchId is included in the
      | update payload.
      |
      | This prevents normal profile edits from unexpectedly failing because
      | of unrelated historical data.
      |
      */

      if (
        data.branchId !==
        undefined
      ) {
        const branch =
          await validateBranchAccess(
            currentUser,
            data.branchId,
            connection
          );

        /*
        |--------------------------------------------------------------------------
        | Existing Owner Must Still Be Valid For New Branch
        |--------------------------------------------------------------------------
        */

        if (
          existing.ownerId
        ) {
          await validateOwner(
            existing.ownerId,
            branch.id,
            connection
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      await updateLead(
        leadId,
        data,
        currentUser.id,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Lead edited",

          outcome:
            "Lead details updated",

          notes:
            data.branchId !==
              undefined &&
            Number(
              data.branchId
            ) !==
              Number(
                existing.branchId
              )
              ? "Lead profile information and primary branch were updated."
              : "Lead profile information was updated.",

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findLeadById(
          leadId,
          currentUser,
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_UPDATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata:
          data.branchId !==
            undefined
            ? {
                previousBranchId:
                  existing.branchId,

                newBranchId:
                  updated.branchId,

                previousBranchName:
                  existing.branchName,

                newBranchName:
                  updated.branchName,
              }
            : null,

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
        // Ignore.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing Lead
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Lost Must Use Dedicated Flow
      |--------------------------------------------------------------------------
      */

      if (
        data.stage ===
        "Lost"
      ) {
        throw new ApiError(
          422,
          "Use the Mark Lost action to close a lead.",
          [],
          "USE_MARK_LOST_FLOW"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Same Stage
      |--------------------------------------------------------------------------
      */

      if (
        existing.stage ===
        data.stage
      ) {
        throw new ApiError(
          409,
          "Lead is already in this stage.",
          [],
          "LEAD_STAGE_UNCHANGED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */

      let status =
        existing.status;

      if (
        data.stage ===
        "Nurture"
      ) {
        status =
          "Open";
      }

      if (
        data.stage ===
        "Active Client"
      ) {
        status =
          "Active Client";
      }

      /*
      |--------------------------------------------------------------------------
      | Update Stage
      |--------------------------------------------------------------------------
      */

      const changed =
        await updateLeadStage(
          {
            leadId,

            stage:
              data.stage,

            status,

            userId:
              currentUser.id,
          },
          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Lead stage could not be changed.",
          [],
          "LEAD_STAGE_CHANGE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            existing.stage,

          newStage:
            data.stage,

          reason:
            data.reason,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Stage change",

          outcome:
            `Moved from ${existing.stage} to ${data.stage}`,

          notes:
            data.reason,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Automatically Create Nurture Profile
      |--------------------------------------------------------------------------
      */

      if (
        data.stage ===
        "Nurture"
      ) {
        await upsertNurtureProfile(
          {
            leadId,

            category:
              "LATER",

            reason:
              data.reason,

            buyingStage:
              null,

            communicationStatus:
              "NOT_CONTACTED",

            reconnectAt:
              existing.followUpAt ||
              null,

            userId:
              currentUser.id,
          },
          connection
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findLeadById(
          leadId,
          currentUser,
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_STAGE_CHANGED",

        previousValues: {
          stage:
            existing.stage,

          status:
            existing.status,
        },

        newValues: {
          stage:
            updated.stage,

          status:
            updated.status,
        },

        metadata: {
          reason:
            data.reason,
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
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Change Owner
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    /*
    |--------------------------------------------------------------------------
    | Super Admin Only
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only Super Admin can reassign lead ownership.",
        [],
        "FORBIDDEN"
      );
    }

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing Lead
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Lead Must Have Branch
      |--------------------------------------------------------------------------
      */

      const branch =
        await validateBranch(
          existing.branchId,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Validate New Owner Against Lead Branch
      |--------------------------------------------------------------------------
      */

      const owner =
        await validateOwner(
          data.ownerId,
          branch.id,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Same Owner
      |--------------------------------------------------------------------------
      */

      if (
        Number(
          existing.ownerId
        ) ===
        Number(
          data.ownerId
        )
      ) {
        throw new ApiError(
          409,
          "This user already owns the lead.",
          [],
          "LEAD_OWNER_UNCHANGED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Update Lead Owner
      |--------------------------------------------------------------------------
      */

      await updateLeadOwner(
        {
          leadId,

          ownerId:
            owner.id,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Move Open Follow-ups To New Owner
      |--------------------------------------------------------------------------
      */

      await connection.query(
        `
          UPDATE followups

          SET
            assigned_to = ?,

            updated_by = ?,

            updated_at =
              UTC_TIMESTAMP()

          WHERE
            lead_id = ?

            AND status =
              'PENDING'
        `,
        [
          owner.id,

          currentUser.id,

          leadId,
        ]
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Owner changed",

          outcome:
            `Assigned to ${owner.fullName}`,

          notes:
            data.reason ||
            "Lead reassigned.",

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findLeadById(
          leadId,
          currentUser,
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_OWNER_CHANGED",

        previousValues: {
          ownerId:
            existing.ownerId,

          ownerName:
            existing.ownerName,
        },

        newValues: {
          ownerId:
            updated.ownerId,

          ownerName:
            updated.ownerName,
        },

        metadata: {
          reason:
            data.reason ||
            null,

          branchId:
            branch.id,

          branchName:
            branch.name,
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
        // Ignore.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Mark Lead Lost
|--------------------------------------------------------------------------
*/

export const markLeadLostService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Already Lost
      |--------------------------------------------------------------------------
      */

      if (
        existing.stage ===
          "Lost" &&
        !data.moveToNurture
      ) {
        throw new ApiError(
          409,
          "Lead is already marked as lost.",
          [],
          "LEAD_ALREADY_LOST"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Destination
      |--------------------------------------------------------------------------
      */

      const nextStage =
        data.moveToNurture
          ? "Nurture"
          : "Lost";

      /*
      |--------------------------------------------------------------------------
      | Reconnect
      |--------------------------------------------------------------------------
      |
      | Preserve current follow-up when moving to nurture.
      |
      */

      const reconnectAt =
        data.moveToNurture
          ? existing.followUpAt ||
            null
          : null;

      /*
      |--------------------------------------------------------------------------
      | Lead
      |--------------------------------------------------------------------------
      */

      const changed =
        await closeLeadState(
          {
            leadId,

            stage:
              nextStage,

            status:
              "Not interested",

            nextAction:
              data.moveToNurture
                ? "Reconnect when relevant"
                : null,

            followUpAt:
              reconnectAt,

            userId:
              currentUser.id,
          },
          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Lead could not be closed.",
          [],
          "LEAD_CLOSE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            existing.stage,

          newStage:
            nextStage,

          reason:
            `${data.reason}: ${data.comment}`,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Nurture Profile
      |--------------------------------------------------------------------------
      |
      | Lost records are still preserved in the Nurture database so they can
      | later be segmented and reconnected.
      |
      */

      await upsertNurtureProfile(
        {
          leadId,

          category:
            "LOST_NOT_INTERESTED",

          reason:
            data.reason,

          buyingStage:
            null,

          communicationStatus:
            data.reason ===
            "No response"
              ? "NO_RESPONSE"
              : "NOT_CONTACTED",

          reconnectAt,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Stage change",

          outcome:
            data.moveToNurture
              ? "Lead closed and moved to nurture"
              : "Lead marked lost / not interested",

          notes:
            `${data.reason}: ${data.comment}`,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findLeadById(
          leadId,
          currentUser,
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_MARKED_LOST",

        previousValues: {
          stage:
            existing.stage,

          status:
            existing.status,

          nextAction:
            existing.nextAction,

          followUpAt:
            existing.followUpAt,
        },

        newValues: {
          stage:
            updated.stage,

          status:
            updated.status,

          nextAction:
            updated.nextAction,

          followUpAt:
            updated.followUpAt,
        },

        metadata: {
          reason:
            data.reason,

          comment:
            data.comment,

          moveToNurture:
            data.moveToNurture,

          nurtureCategory:
            "LOST_NOT_INTERESTED",
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
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Get Assignable Owners
|--------------------------------------------------------------------------
|
| SUPER_ADMIN
| - Can request any active branch.
| - Receives Super Admin + active owners from that branch.
|
| OWNER
| - Branch is determined from the database.
| - Cannot request another branch.
| - Receives only their own user as the selectable owner.
|
*/

export const getLeadOwnersService =
  async (
    currentUser,
    branchId = null
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Active Branches
    |--------------------------------------------------------------------------
    */

    const branches =
      await listActiveLeadBranches();

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role ===
      "SUPER_ADMIN"
    ) {
      /*
       * No branch selected yet.
       *
       * Frontend first displays
       * Primary Branch.
       */

      if (!branchId) {
        return {
          branches,

          owners: [],
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Requested Branch
      |--------------------------------------------------------------------------
      */

      const branch =
        await validateBranch(
          branchId
        );

      /*
      |--------------------------------------------------------------------------
      | Branch Owners
      |--------------------------------------------------------------------------
      */

      const owners =
        await listAssignableLeadOwners(
          branch.id
        );

      return {
        branches,

        selectedBranch:
          branch,

        owners,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Normal Owner
    |--------------------------------------------------------------------------
    */

    const currentOwner =
      await findLeadOwner(
        currentUser.id
      );

    if (!currentOwner) {
      throw new ApiError(
        404,
        "Current user was not found.",
        [],
        "CURRENT_USER_NOT_FOUND"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Active
    |--------------------------------------------------------------------------
    */

    if (
      String(
        currentOwner.status
      ).toUpperCase() !==
      "ACTIVE"
    ) {
      throw new ApiError(
        403,
        "Your user account is inactive.",
        [],
        "USER_INACTIVE"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Branch Required
    |--------------------------------------------------------------------------
    */

    if (
      !currentOwner.branchId
    ) {
      throw new ApiError(
        422,
        "Your account does not have a branch assigned.",
        [],
        "USER_BRANCH_REQUIRED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Cannot Request Another Branch
    |--------------------------------------------------------------------------
    */

    if (
      branchId &&
      Number(
        branchId
      ) !==
        Number(
          currentOwner.branchId
        )
    ) {
      throw new ApiError(
        403,
        "You cannot access owners from another branch.",
        [],
        "BRANCH_ACCESS_DENIED"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Their Branch
    |--------------------------------------------------------------------------
    */

    const selectedBranch =
      await validateBranch(
        currentOwner.branchId
      );

    return {
      branches:
        branches.filter(
          (
            branch
          ) =>
            Number(
              branch.id
            ) ===
            Number(
              currentOwner.branchId
            )
        ),

      selectedBranch,

      /*
       * Normal Owner cannot assign
       * the lead to another user.
       */

      owners: [
        currentOwner,
      ],
    };
  };