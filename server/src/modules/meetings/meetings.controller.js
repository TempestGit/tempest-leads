import {
  cancelMeetingService,
  completeMeetingService,
  createMeetingService,
  getMeetingsService,
  noShowMeetingService,
  rescheduleMeetingService,
} from "./meetings.service.js";

/*
|--------------------------------------------------------------------------
| Request Metadata
|--------------------------------------------------------------------------
*/

const metadata =
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
| GET /api/meetings
|--------------------------------------------------------------------------
*/

export const listMeetingsController =
  async (
    req,
    res
  ) => {
    const result =
      await getMeetingsService(
        req.validated.query,
        req.user
      );

    res.status(200).json({
      success:
        true,

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| POST /api/meetings
|--------------------------------------------------------------------------
*/

export const createMeetingController =
  async (
    req,
    res
  ) => {
    const meeting =
      await createMeetingService({
        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(201).json({
      success:
        true,

      message:
        "Meeting scheduled.",

      data: {
        meeting,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const completeMeetingController =
  async (
    req,
    res
  ) => {
    const meeting =
      await completeMeetingService({
        meetingId:
          req.validated
            .params
            .meetingId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(200).json({
      success:
        true,

      message:
        "Meeting completed and activity recorded.",

      data: {
        meeting,
      },
    });
  };

  /*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

export const rescheduleMeetingController =
  async (
    req,
    res
  ) => {
    const meeting =
      await rescheduleMeetingService({
        meetingId:
          req.validated
            .params
            .meetingId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(200).json({
      success: true,

      message:
        "Meeting rescheduled.",

      data: {
        meeting,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Cancel
|--------------------------------------------------------------------------
*/

export const cancelMeetingController =
  async (
    req,
    res
  ) => {
    const meeting =
      await cancelMeetingService({
        meetingId:
          req.validated
            .params
            .meetingId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(200).json({
      success: true,

      message:
        "Meeting cancelled.",

      data: {
        meeting,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| No-show
|--------------------------------------------------------------------------
*/

export const noShowMeetingController =
  async (
    req,
    res
  ) => {
    const meeting =
      await noShowMeetingService({
        meetingId:
          req.validated
            .params
            .meetingId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(200).json({
      success: true,

      message:
        "Meeting marked as no-show.",

      data: {
        meeting,
      },
    });
  };