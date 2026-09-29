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
| Root Key
|--------------------------------------------------------------------------
*/

const LEAD_QUERY_ROOT = [
  "leads",
];

/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

export const leadKeys = {
  all:
    LEAD_QUERY_ROOT,

  lists:
    () => [
      ...LEAD_QUERY_ROOT,
      "list",
    ],

  list:
    (
      params = {}
    ) => [
      ...LEAD_QUERY_ROOT,
      "list",
      params,
    ],

  details:
    () => [
      ...LEAD_QUERY_ROOT,
      "detail",
    ],

  detail:
    (
      leadId
    ) => [
      ...LEAD_QUERY_ROOT,
      "detail",
      Number(
        leadId
      ),
    ],

  options:
    () => [
      ...LEAD_QUERY_ROOT,
      "options",
    ],

  owners:
    (
      branchId = null
    ) => [
      ...LEAD_QUERY_ROOT,
      "owners",

      branchId
        ? Number(
            branchId
          )
        : "branches",
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
  (
    enabled = true
  ) =>
    useQuery({
      queryKey:
        leadKeys.options(),

      queryFn:
        getLeadOptionsRequest,

      enabled:
        Boolean(
          enabled
        ),
    });

/*
|--------------------------------------------------------------------------
| Branches / Owners
|--------------------------------------------------------------------------
|
| branchId = null
| → loads branch options.
|
| branchId = 1
| → loads owners available for branch 1.
|
*/

export const useLeadOwnersQuery =
  (
    branchId = null,
    enabled = true
  ) =>
    useQuery({
      queryKey:
        leadKeys.owners(
          branchId
        ),

      queryFn: () =>
        getLeadOwnersRequest(
          branchId
        ),

      enabled:
        Boolean(
          enabled
        ),
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
        queryKey:
          LEAD_QUERY_ROOT,
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

      queryClient.invalidateQueries({
        queryKey: [
          "teamAssignments",
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