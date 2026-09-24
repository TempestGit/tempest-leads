import {
  getTeamAssignmentOptionsService,
  getTeamAssignmentsService,
  removeTeamAssignmentService,
  saveTeamAssignmentService,
  updateTeamAssignmentStatusService,
} from "./teamAssignments.service.js";

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
| Options
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentOptionsController =
  async (
    req,
    res
  ) => {
    const result =
      await getTeamAssignmentOptionsService({
        branchId:
          req.validated
            ?.query
            ?.branchId,

        currentUser:
          req.user,
      });

    res.status(200).json({
      success: true,

      data:
        result,
    });
  };

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentsController =
  async (
    req,
    res
  ) => {
    const result =
      await getTeamAssignmentsService(
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
| Save
|--------------------------------------------------------------------------
*/

export const saveTeamAssignmentController =
  async (
    req,
    res
  ) => {
    const assignment =
      await saveTeamAssignmentService({
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
        "Team assignment saved.",

      data: {
        assignment,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const updateTeamAssignmentStatusController =
  async (
    req,
    res
  ) => {
    const assignment =
      await updateTeamAssignmentStatusService({
        assignmentId:
          req.validated
            .params
            .assignmentId,

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
        "Team assignment status updated.",

      data: {
        assignment,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Remove
|--------------------------------------------------------------------------
*/

export const removeTeamAssignmentController =
  async (
    req,
    res
  ) => {
    const result =
      await removeTeamAssignmentService({
        assignmentId:
          req.validated
            .params
            .assignmentId,

        currentUser:
          req.user,

        ...metadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Team assignment removed.",

      data:
        result,
    });
  };