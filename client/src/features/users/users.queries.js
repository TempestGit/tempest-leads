import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUserRequest,
  getUserOptionsRequest,
  getUsersRequest,
  updateUserRequest,
  updateUserStatusRequest,
} from "./users.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const userKeys = {
  all: () => [
    "users",
  ],

  lists: () => [
    "users",
    "list",
  ],

  list: (
    params = {}
  ) => [
    "users",
    "list",
    params,
  ],

  options: () => [
    "users",
    "options",
  ],
};

/*
|--------------------------------------------------------------------------
| Users List
|--------------------------------------------------------------------------
*/

export const useUsersQuery =
  (
    params = {}
  ) => {
    return useQuery({
      queryKey:
        userKeys.list(
          params
        ),

      queryFn: () =>
        getUsersRequest(
          params
        ),
    });
  };

/*
|--------------------------------------------------------------------------
| User Options
|--------------------------------------------------------------------------
*/

export const useUserOptionsQuery =
  (
    enabled = true
  ) => {
    return useQuery({
      queryKey:
        userKeys.options(),

      queryFn:
        getUserOptionsRequest,

      enabled:
        Boolean(
          enabled
        ),
    });
  };

/*
|--------------------------------------------------------------------------
| Invalidate Users
|--------------------------------------------------------------------------
*/

const invalidateUsers =
  async (
    queryClient
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey:
          userKeys.all(),
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
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
| Create User
|--------------------------------------------------------------------------
*/

export const useCreateUserMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createUserRequest,

      onSuccess:
        async () => {
          await invalidateUsers(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

export const useUpdateUserMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateUserRequest,

      onSuccess:
        async () => {
          await invalidateUsers(
            queryClient
          );
        },
    });
  };

/*
|--------------------------------------------------------------------------
| Update User Status
|--------------------------------------------------------------------------
*/

export const useUpdateUserStatusMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateUserStatusRequest,

      onSuccess:
        async () => {
          await invalidateUsers(
            queryClient
          );
        },
    });
  };