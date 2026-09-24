import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| Lead Team
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentsRequest =
  async (
    leadId
  ) => {
    const response =
      await apiClient.get(
        `/team-assignments/lead/${leadId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentOptionsRequest =
  async (
    branchId
  ) => {
    const response =
      await apiClient.get(
        "/team-assignments/options",
        {
          params:
            branchId
              ? {
                  branchId,
                }
              : {},
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Save
|--------------------------------------------------------------------------
*/

export const saveTeamAssignmentRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.post(
        `/team-assignments/lead/${leadId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const updateTeamAssignmentStatusRequest =
  async ({
    assignmentId,
    status,
  }) => {
    const response =
      await apiClient.patch(
        `/team-assignments/${assignmentId}/status`,
        {
          status,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export const deleteTeamAssignmentRequest =
  async (
    assignmentId
  ) => {
    const response =
      await apiClient.delete(
        `/team-assignments/${assignmentId}`
      );

    return response.data;
  };