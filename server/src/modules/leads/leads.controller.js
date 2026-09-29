import {
  changeLeadOwnerService,
  changeLeadStageService,
  createLeadService,
  getLeadOptionsService,
  getLeadOwnersService,
  getLeadService,
  getLeadsService,
  markLeadLostService,
  updateLeadService,
} from "./leads.service.js";

/*
|--------------------------------------------------------------------------
| Metadata
|--------------------------------------------------------------------------
*/

const getMetadata =
  (
    req
  ) => ({
    ipAddress:
      req.ip ||
      null,

    userAgent:
      req.get(
        "user-agent"
      ) ||
      null,
  });

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const listLeadsController =
  async (
    req,
    res
  ) => {
    const result =
      await getLeadsService(
        req.validated.query,
        req.user
      );

    res.status(200).json({
      success: true,

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsController =
  async (
    req,
    res
  ) => {
    const result =
      await getLeadOptionsService(
        req.user
      );

    res.status(200).json({
      success: true,

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| Owner Options
|--------------------------------------------------------------------------
*/

export const getLeadOwnersController =
  async (
    req,
    res
  ) => {
    const result =
      await getLeadOwnersService(
        req.user,

        req.validated
          ?.query
          ?.branchId ||
          null
      );

    res.status(200).json({
      success: true,

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export const getLeadController =
  async (
    req,
    res
  ) => {
    const lead =
      await getLeadService(
        req.validated
          .params
          .leadId,

        req.user
      );

    res.status(200).json({
      success: true,

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const createLeadController =
  async (
    req,
    res
  ) => {
    const lead =
      await createLeadService({
        data:
          req.validated.body,

        currentUser:
          req.user,

        ...getMetadata(
          req
        ),
      });

    res.status(201).json({
      success: true,

      message:
        "Lead created.",

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateLeadController =
  async (
    req,
    res
  ) => {
    const lead =
      await updateLeadService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...getMetadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Lead updated.",

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageController =
  async (
    req,
    res
  ) => {
    const lead =
      await changeLeadStageService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...getMetadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Lead stage updated.",

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Owner
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerController =
  async (
    req,
    res
  ) => {
    const lead =
      await changeLeadOwnerService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...getMetadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Lead owner updated.",

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Lost
|--------------------------------------------------------------------------
*/

export const markLeadLostController =
  async (
    req,
    res
  ) => {
    const lead =
      await markLeadLostService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...getMetadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        req.validated
          .body
          .moveToNurture
          ? "Lead closed and moved to nurture."
          : "Lead marked as lost.",

      data: {
        lead,
      },
    });
  };