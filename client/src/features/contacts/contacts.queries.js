import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createContactRequest,
  getContactRequest,
  getContactsRequest,
  updateContactRequest,
} from "./contacts.api.js";

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const contactKeys = {
  all: [
    "contacts",
  ],

  lists: () => [
    ...contactKeys.all,
    "list",
  ],

  list: (params) => [
    ...contactKeys.lists(),
    params,
  ],

  details: () => [
    ...contactKeys.all,
    "detail",
  ],

  detail: (id) => [
    ...contactKeys.details(),
    id,
  ],
};

/*
|--------------------------------------------------------------------------
| Contacts List
|--------------------------------------------------------------------------
*/

export const useContactsQuery =
  (params = {}) =>
    useQuery({
      queryKey:
        contactKeys.list(
          params
        ),

      queryFn: () =>
        getContactsRequest(
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
| Contact Detail
|--------------------------------------------------------------------------
*/

export const useContactQuery =
  (contactId) =>
    useQuery({
      queryKey:
        contactKeys.detail(
          contactId
        ),

      queryFn: () =>
        getContactRequest(
          contactId
        ),

      enabled:
        Boolean(contactId),
    });

/*
|--------------------------------------------------------------------------
| Create Contact
|--------------------------------------------------------------------------
*/

export const useCreateContactMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createContactRequest,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey:
              contactKeys.lists(),
          }),

          /*
          |--------------------------------------------------------------------------
          | Company contact count changes too
          |--------------------------------------------------------------------------
          */

          queryClient.invalidateQueries({
            queryKey: [
              "companies",
            ],
          }),
        ]);
      },
    });
  };

/*
|--------------------------------------------------------------------------
| Update Contact
|--------------------------------------------------------------------------
*/

export const useUpdateContactMutation =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateContactRequest,

      onSuccess: async (
        response,
        variables
      ) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey:
              contactKeys.lists(),
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "companies",
            ],
          }),
        ]);

        if (
          variables?.contactId
        ) {
          queryClient.setQueryData(
            contactKeys.detail(
              variables.contactId
            ),
            response
          );
        }
      },
    });
  };