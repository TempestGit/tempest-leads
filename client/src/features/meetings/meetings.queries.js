import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelMeetingRequest,
  completeMeetingRequest,
  createMeetingRequest,
  getMeetingsRequest,
  noShowMeetingRequest,
  rescheduleMeetingRequest,
} from "./meetings.api.js";

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const meetingKeys = {
  all: [
    "meetings",
  ],

  lists: () => [
    ...meetingKeys.all,
    "list",
  ],

  list: (
    params
  ) => [
    ...meetingKeys.lists(),
    params,
  ],
};

/*
|--------------------------------------------------------------------------
| Meetings Query
|--------------------------------------------------------------------------
*/

export const useMeetingsQuery = (
  params = {}
) =>
  useQuery({
    queryKey:
      meetingKeys.list(
        params
      ),

    queryFn: () =>
      getMeetingsRequest(
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
| Invalidate Related CRM Data
|--------------------------------------------------------------------------
*/

const invalidateMeetingData =
  async (
    queryClient
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          meetingKeys.all,
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

      queryClient.invalidateQueries({
        queryKey: [
          "followups",
        ],
      }),
    ]);
  };

/*
|--------------------------------------------------------------------------
| Schedule Meeting
|--------------------------------------------------------------------------
*/

export const useCreateMeetingMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createMeetingRequest,

      onSuccess:
        async () => {
          await invalidateMeetingData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const useCompleteMeetingMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        completeMeetingRequest,

      onSuccess:
        async () => {
          await invalidateMeetingData(
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

export const useRescheduleMeetingMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        rescheduleMeetingRequest,

      onSuccess:
        async () => {
          await invalidateMeetingData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Cancel
|--------------------------------------------------------------------------
*/

export const useCancelMeetingMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        cancelMeetingRequest,

      onSuccess:
        async () => {
          await invalidateMeetingData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| No-show
|--------------------------------------------------------------------------
*/

export const useNoShowMeetingMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        noShowMeetingRequest,

      onSuccess:
        async () => {
          await invalidateMeetingData(
            queryClient
          );
        },
    });
  };