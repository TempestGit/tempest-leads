import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCompanyRequest,
  deleteCompanyRequest,
  getCompaniesRequest,
  getCompanyRequest,
  updateCompanyRequest,
} from "./companies.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const companyKeys = {
  all: [
    "companies",
  ],

  lists: () => [
    ...companyKeys.all,
    "list",
  ],

  list: (params) => [
    ...companyKeys.lists(),
    params,
  ],

  details: () => [
    ...companyKeys.all,
    "detail",
  ],

  detail: (id) => [
    ...companyKeys.details(),
    id,
  ],
};

/*
|--------------------------------------------------------------------------
| Companies List
|--------------------------------------------------------------------------
*/

export const useCompaniesQuery =
  (params = {}) =>
    useQuery({
      queryKey:
        companyKeys.list(
          params
        ),

      queryFn: () =>
        getCompaniesRequest(
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
| Company Detail
|--------------------------------------------------------------------------
*/

export const useCompanyQuery =
  (companyId) =>
    useQuery({
      queryKey:
        companyKeys.detail(
          companyId
        ),

      queryFn: () =>
        getCompanyRequest(
          companyId
        ),

      enabled: Boolean(
        companyId
      ),
    });

/*
|--------------------------------------------------------------------------
| Create Company
|--------------------------------------------------------------------------
*/

export const useCreateCompanyMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createCompanyRequest,

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            companyKeys.lists(),
        });
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Update Company
|--------------------------------------------------------------------------
*/

export const useUpdateCompanyMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateCompanyRequest,

      onSuccess: async (
        response,
        variables
      ) => {
        await queryClient.invalidateQueries({
          queryKey:
            companyKeys.lists(),
        });

        if (
          variables?.companyId
        ) {
          queryClient.setQueryData(
            companyKeys.detail(
              variables.companyId
            ),
            response
          );
        }
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Delete Company
|--------------------------------------------------------------------------
*/

export const useDeleteCompanyMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        deleteCompanyRequest,

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            companyKeys.all,
        });
      },
    });
  };