import {
  getBriefService,
  saveBriefService,
  updateBriefRouteService,
  updateBriefStatusService,
} from "./briefs.service.js";

/*
|--------------------------------------------------------------------------
| Request Metadata
|--------------------------------------------------------------------------
*/

const metadata =
  (req) => ({
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
| GET
|--------------------------------------------------------------------------
*/

export const getBriefController =
  async (
    req,
    res
  ) => {
    const result =
      await getBriefService(
        req.validated
          .params
          .leadId,

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
| PUT
|--------------------------------------------------------------------------
*/

export const saveBriefController =
  async (
    req,
    res
  ) => {
    const brief =
      await saveBriefService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Brief saved.",

      data: {
        brief,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| PATCH Status
|--------------------------------------------------------------------------
*/

export const updateBriefStatusController =
  async (
    req,
    res
  ) => {
    const brief =
      await updateBriefStatusService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Brief status updated.",

      data: {
        brief,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| PATCH Route
|--------------------------------------------------------------------------
*/

export const updateBriefRouteController =
  async (
    req,
    res
  ) => {
    const brief =
      await updateBriefRouteService({
        leadId:
          req.validated
            .params
            .leadId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Brief route updated.",

      data: {
        brief,
      },
    });
  };