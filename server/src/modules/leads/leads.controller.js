import {
  changeLeadOwnerService,
  changeLeadStageService,
  createLeadService,
  getLeadOptionsService,
  getLeadService,
  getLeadsService,
  updateLeadService,
} from "./leads.service.js";

/*
|--------------------------------------------------------------------------
| Metadata
|--------------------------------------------------------------------------
*/

const metadata =
  (req) => ({
    ipAddress:
      req.ip || null,

    userAgent:
      req.get(
        "user-agent"
      ) || null,
  });

/*
|--------------------------------------------------------------------------
| GET /api/leads/options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsController =
  async (req, res) => {
    const result =
      await getLeadOptionsService(
        req.user
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

/*
|--------------------------------------------------------------------------
| GET /api/leads
|--------------------------------------------------------------------------
*/

export const listLeadsController =
  async (req, res) => {
    const result =
      await getLeadsService(
        req.validated.query,
        req.user
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

/*
|--------------------------------------------------------------------------
| GET /api/leads/:leadId
|--------------------------------------------------------------------------
*/

export const getLeadController =
  async (req, res) => {
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
| POST /api/leads
|--------------------------------------------------------------------------
*/

export const createLeadController =
  async (req, res) => {
    const lead =
      await createLeadService({
        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(201).json({
      success: true,

      message:
        "Lead created with first follow-up.",

      data: {
        lead,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| PATCH /api/leads/:leadId
|--------------------------------------------------------------------------
*/

export const updateLeadController =
  async (req, res) => {
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

        ...metadata(req),
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
  async (req, res) => {
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

        ...metadata(req),
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
  async (req, res) => {
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

        ...metadata(req),
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