import {
  createActivityService,
  getActivitiesService,
} from "./activities.service.js";

/*
|--------------------------------------------------------------------------
| Request Metadata
|--------------------------------------------------------------------------
*/

const getMetadata =
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
| GET /api/activities
|--------------------------------------------------------------------------
*/

export const listActivitiesController =
  async (
    req,
    res
  ) => {
    const result =
      await getActivitiesService(
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
| POST /api/activities
|--------------------------------------------------------------------------
*/

export const createActivityController =
  async (
    req,
    res
  ) => {
    const result =
      await createActivityService({
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
        "Activity recorded.",

      data: result,
    });
  };