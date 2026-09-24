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
  updateLeadRequest,
} from "./leads.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
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

  list: (params) => [
    ...leadKeys.lists(),
    params,
  ],

  options: () => [
    ...leadKeys.all,
    "options",
  ],

  details: () => [
    ...leadKeys.all,
    "detail",
  ],

  detail: (id) => [
    ...leadKeys.details(),
    id,
  ],
};

/*
|--------------------------------------------------------------------------
| Leads
|--------------------------------------------------------------------------
*/

export const useLeadsQuery = (
  params
) =>
  useQuery({
    queryKey:
      leadKeys.list(params),

    queryFn: () =>
      getLeadsRequest(
        params
      ),

    placeholderData:
      (previousData) =>
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

      staleTime:
        60 * 1000,
    });

/*
|--------------------------------------------------------------------------
| Lead
|--------------------------------------------------------------------------
*/

export const useLeadQuery = (
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
      Boolean(leadId),
  });

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

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey:
              leadKeys.lists(),
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "companies",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "contacts",
            ],
          }),
        ]);
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

      onSuccess: async (
        response,
        variables
      ) => {
        await queryClient.invalidateQueries({
          queryKey:
            leadKeys.lists(),
        });

        if (
          variables?.leadId
        ) {
          queryClient.setQueryData(
            leadKeys.detail(
              variables.leadId
            ),
            response
          );
        }
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

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            leadKeys.all,
        });
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

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            leadKeys.all,
        });
      },
    });
  };