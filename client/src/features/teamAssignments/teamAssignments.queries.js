import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteTeamAssignmentRequest,
  getTeamAssignmentOptionsRequest,
  getTeamAssignmentsRequest,
  saveTeamAssignmentRequest,
  updateTeamAssignmentStatusRequest,
} from "./teamAssignments.api.js";

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const teamAssignmentKeys = {
  all: [
    "teamAssignments",
  ],

  lead: (
    leadId
  ) => [
    ...teamAssignmentKeys.all,
    "lead",
    Number(
      leadId
    ),
  ],

  options: (
    branchId
  ) => [
    ...teamAssignmentKeys.all,
    "options",

    branchId
      ? Number(
          branchId
        )
      : "all-branches",
  ],
};

/*
|--------------------------------------------------------------------------
| Lead Assignments
|--------------------------------------------------------------------------
*/

export const useTeamAssignmentsQuery =
  (
    leadId
  ) =>
    useQuery({
      queryKey:
        teamAssignmentKeys.lead(
          leadId
        ),

      queryFn: () =>
        getTeamAssignmentsRequest(
          leadId
        ),

      enabled:
        Boolean(
          leadId
        ),
    });

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
|
| Important:
|
| Run even when branchId is empty.
|
| GET /options without branchId returns the branch list.
| GET /options?branchId=1 returns branches + users from that branch.
|
*/

export const useTeamAssignmentOptionsQuery =
  (
    branchId,
    enabled = true
  ) =>
    useQuery({
      queryKey:
        teamAssignmentKeys.options(
          branchId
        ),

      queryFn: () =>
        getTeamAssignmentOptionsRequest(
          branchId ||
            null
        ),

      enabled:
        Boolean(
          enabled
        ),
    });

/*
|--------------------------------------------------------------------------
| Invalidate
|--------------------------------------------------------------------------
*/

const invalidateTeamData =
  async (
    queryClient,
    leadId
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          teamAssignmentKeys.lead(
            leadId
          ),
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "activities",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      }),
    ]);
  };

/*
|--------------------------------------------------------------------------
| Save
|--------------------------------------------------------------------------
*/

export const useSaveTeamAssignmentMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        saveTeamAssignmentRequest,

      onSuccess:
        async (
          _response,
          variables
        ) => {
          await invalidateTeamData(
            queryClient,
            variables.leadId
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const useUpdateTeamAssignmentStatusMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateTeamAssignmentStatusRequest,

      onSuccess:
        async (
          response
        ) => {
          const leadId =
            response
              ?.data
              ?.assignment
              ?.leadId;

          if (
            leadId
          ) {
            await invalidateTeamData(
              queryClient,
              leadId
            );

            return;
          }

          await queryClient.invalidateQueries({
            queryKey:
              teamAssignmentKeys.all,
          });
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export const useDeleteTeamAssignmentMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        deleteTeamAssignmentRequest,

      onSuccess:
        async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey:
                teamAssignmentKeys.all,
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "activities",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "leads",
              ],
            }),
          ]);
        },
    });
  };