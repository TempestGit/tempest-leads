import {
  getNurtureLeadService,
  getNurtureService,
  scheduleReconnectService,
  updateNurtureService,
} from "./nurture.service.js";

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
| GET /api/nurture
|--------------------------------------------------------------------------
*/

export const listNurtureController =
  async (
    req,
    res
  ) => {
    const result =
      await getNurtureService(
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
| GET /api/nurture/:leadId
|--------------------------------------------------------------------------
*/

export const getNurtureController =
  async (
    req,
    res
  ) => {
    const nurture =
      await getNurtureLeadService(
        req.validated
          .params
          .leadId,

        req.user
      );

    res.status(200).json({
      success: true,

      data: {
        nurture,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| PATCH /api/nurture/:leadId
|--------------------------------------------------------------------------
*/

export const updateNurtureController =
  async (
    req,
    res
  ) => {
    const nurture =
      await updateNurtureService({
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
        "Nurture profile updated.",

      data: {
        nurture,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| POST /api/nurture/:leadId/reconnect
|--------------------------------------------------------------------------
*/

export const reconnectNurtureController =
  async (
    req,
    res
  ) => {
    const result =
      await scheduleReconnectService({
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

    res.status(201).json({
      success: true,

      message:
        "Reconnect scheduled.",

      data:
        result,
    });
  };