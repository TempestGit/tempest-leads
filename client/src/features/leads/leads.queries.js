import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  changeLeadOwnerRequest,
  changeLeadStageRequest,
  createLeadRequest,
  getLeadOptionsRequest,
  getLeadRequest,
  getLeadsRequest,
  getLeadOwnersRequest,
  markLeadLostRequest,
  updateLeadRequest,
} from "./leads.api.js";

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const leadKeys = {
  all: [
    "leads",
  ],

  lists: () => [
    ...leadKeys.all,
    "list",
  ],

  list: (
    params
  ) => [
    ...leadKeys.lists(),
    params,
  ],

  details: () => [
    ...leadKeys.all,
    "detail",
  ],

  detail: (
    leadId
  ) => [
    ...leadKeys.details(),
    Number(
      leadId
    ),
  ],

  options: () => [
    ...leadKeys.all,
    "options",
  ],
};

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const useLeadsQuery =
  (
    params = {}
  ) =>
    useQuery({
      queryKey:
        leadKeys.list(
          params
        ),

      queryFn: () =>
        getLeadsRequest(
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
| Options
|--------------------------------------------------------------------------
*/

export const useLeadOptionsQuery =
  () =>
    useQuery({
      queryKey:
        leadKeys.options(),

      queryFn:
        getLeadOptionsRequest,
    });

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export const useLeadQuery =
  (
    leadId
  ) =>
    useQuery({
      queryKey:
        leadKeys.detail(
          leadId
        ),

      queryFn: () =>
        getLeadRequest(
          leadId
        ),

      enabled:
        Boolean(
          leadId
        ),
    });

/*
|--------------------------------------------------------------------------
| Related Invalidation
|--------------------------------------------------------------------------
*/

const invalidateLeadData =
  async (
    queryClient
  ) => {
    await Promise.all([
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

      queryClient.invalidateQueries({
        queryKey: [
          "followups",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "meetings",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "nurture",
        ],
      }),
    ]);
  };

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const useCreateLeadMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createLeadRequest,

      onSuccess:
        async () => {
          await invalidateLeadData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const useUpdateLeadMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateLeadRequest,

      onSuccess:
        async () => {
          await invalidateLeadData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Stage
|--------------------------------------------------------------------------
*/

export const useChangeLeadStageMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        changeLeadStageRequest,

      onSuccess:
        async () => {
          await invalidateLeadData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Owner
|--------------------------------------------------------------------------
*/

export const useChangeLeadOwnerMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        changeLeadOwnerRequest,

      onSuccess:
        async () => {
          await invalidateLeadData(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Mark Lost
|--------------------------------------------------------------------------
*/

export const useMarkLeadLostMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        markLeadLostRequest,

      onSuccess:
        async () => {
          await invalidateLeadData(
            queryClient
          );
        },
    });
  };

  /*
|--------------------------------------------------------------------------
| Lead Owners
|--------------------------------------------------------------------------
*/

export const useLeadOwnersQuery =
  (
    enabled = true
  ) =>
    useQuery({
      queryKey: [
        "leads",
        "owners",
      ],

      queryFn:
        getLeadOwnersRequest,

      enabled,
    });