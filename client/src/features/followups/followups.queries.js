import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeFollowupRequest,
  createFollowupRequest,
  getFollowupsRequest,
  rescheduleFollowupRequest,
} from "./followups.api.js";

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const followupKeys = {
  all: [
    "followups",
  ],

  lists: () => [
    ...followupKeys.all,
    "list",
  ],

  list: (
    params
  ) => [
    ...followupKeys.lists(),
    params,
  ],
};

/*
|--------------------------------------------------------------------------
| List Query
|--------------------------------------------------------------------------
*/

export const useFollowupsQuery = (
  params = {}
) =>
  useQuery({
    queryKey:
      followupKeys.list(
        params
      ),

    queryFn: () =>
      getFollowupsRequest(
        params
      ),

    placeholderData:
      (
        previousData
      ) =>
        previousData,
  });

/*
|--------------------------------------------------------------------------
| Refresh Related Data
|--------------------------------------------------------------------------
*/

const invalidate =
  async (
    queryClient
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          followupKeys.all,
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "activities",
        ],
      }),
    ]);
  };

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const useCreateFollowupMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createFollowupRequest,

      onSuccess:
        async () => {
          await invalidate(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Complete
|--------------------------------------------------------------------------
*/

export const useCompleteFollowupMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        completeFollowupRequest,

      onSuccess:
        async () => {
          await invalidate(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

export const useRescheduleFollowupMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        rescheduleFollowupRequest,

      onSuccess:
        async () => {
          await invalidate(
            queryClient
          );
        },
    });
  };