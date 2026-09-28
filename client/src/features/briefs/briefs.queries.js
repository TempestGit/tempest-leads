import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBriefRequest,
  saveBriefRequest,
  updateBriefRouteRequest,
  updateBriefStatusRequest,
} from "./briefs.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const briefKeys = {
  all: [
    "briefs",
  ],

  details: () => [
    ...briefKeys.all,
    "detail",
  ],

  detail: (
    leadId
  ) => [
    ...briefKeys.details(),
    Number(
      leadId
    ),
  ],
};

/*
|--------------------------------------------------------------------------
| Brief
|--------------------------------------------------------------------------
*/

export const useBriefQuery =
  (
    leadId
  ) =>
    useQuery({
      queryKey:
        briefKeys.detail(
          leadId
        ),

      queryFn: () =>
        getBriefRequest(
          leadId
        ),

      enabled:
        Boolean(
          leadId
        ),
    });

/*
|--------------------------------------------------------------------------
| Invalidate Related Data
|--------------------------------------------------------------------------
*/

const invalidateBriefData =
  async (
    queryClient,
    leadId
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          briefKeys.detail(
            leadId
          ),
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
| Save
|--------------------------------------------------------------------------
*/

export const useSaveBriefMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        saveBriefRequest,

      onSuccess:
        async (
          _result,
          variables
        ) => {
          await invalidateBriefData(
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

export const useUpdateBriefStatusMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateBriefStatusRequest,

      onSuccess:
        async (
          _result,
          variables
        ) => {
          await invalidateBriefData(
            queryClient,
            variables.leadId
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

export const useUpdateBriefRouteMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateBriefRouteRequest,

      onSuccess:
        async (
          _result,
          variables
        ) => {
          await invalidateBriefData(
            queryClient,
            variables.leadId
          );
        },
    });
  };