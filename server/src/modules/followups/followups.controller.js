import {
  completeFollowupService,
  createFollowupService,
  getFollowupsService,
  rescheduleFollowupService,
} from "./followups.service.js";

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

export const listFollowupsController =
  async (
    req,
    res
  ) => {
    const result =
      await getFollowupsService(
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
| Schedule
|--------------------------------------------------------------------------
*/

export const createFollowupController =
  async (
    req,
    res
  ) => {
    const followup =
      await createFollowupService({
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
        "Follow-up scheduled.",

      data: {
        followup,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Complete
|--------------------------------------------------------------------------
*/

export const completeFollowupController =
  async (
    req,
    res
  ) => {
    const result =
      await completeFollowupService({
        followupId:
          req.validated
            .params
            .followupId,

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
        "Follow-up completed and next action scheduled.",

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

export const rescheduleFollowupController =
  async (
    req,
    res
  ) => {
    const result =
      await rescheduleFollowupService({
        followupId:
          req.validated
            .params
            .followupId,

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
        "Follow-up rescheduled.",

      data:
        result,
    });
  };