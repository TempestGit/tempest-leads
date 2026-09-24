import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNurtureLeadRequest,
  getNurtureRequest,
  scheduleReconnectRequest,
  updateNurtureRequest,
} from "./nurture.api.js";

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const nurtureKeys = {
  all: [
    "nurture",
  ],

  lists: () => [
    ...nurtureKeys.all,
    "list",
  ],

  list: (
    params
  ) => [
    ...nurtureKeys.lists(),
    params,
  ],

  details: () => [
    ...nurtureKeys.all,
    "detail",
  ],

  detail: (
    leadId
  ) => [
    ...nurtureKeys.details(),
    Number(
      leadId
    ),
  ],
};

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const useNurtureQuery = (
  params = {}
) =>
  useQuery({
    queryKey:
      nurtureKeys.list(
        params
      ),

    queryFn: () =>
      getNurtureRequest(
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
| Detail
|--------------------------------------------------------------------------
*/

export const useNurtureLeadQuery = (
  leadId,
  options = {}
) =>
  useQuery({
    queryKey:
      nurtureKeys.detail(
        leadId
      ),

    queryFn: () =>
      getNurtureLeadRequest(
        leadId
      ),

    enabled:
      options.enabled ??
      Boolean(
        leadId
      ),
  });

/*
|--------------------------------------------------------------------------
| Invalidate
|--------------------------------------------------------------------------
*/

const invalidateNurtureData =
  async (
    queryClient
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          nurtureKeys.all,
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

      queryClient.invalidateQueries({
        queryKey: [
          "activities",
        ],
      }),
    ]);
  };

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const useUpdateNurtureMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateNurtureRequest,

      onSuccess:
        async () => {
          await invalidateNurtureData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Reconnect
|--------------------------------------------------------------------------
*/

export const useScheduleReconnectMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        scheduleReconnectRequest,

      onSuccess:
        async () => {
          await invalidateNurtureData(
            queryClient
          );
        },
    });
  };