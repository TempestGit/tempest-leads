import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContactRequest, deleteContactRequest, getContactRequest, getContactsRequest, updateContactRequest } from "./contacts.api.js";

export const contactKeys = {
  all: ["contacts"],
  lists: () => [...contactKeys.all, "list"],
  list: params => [...contactKeys.lists(), params],
  details: () => [...contactKeys.all, "detail"],
  detail: id => [...contactKeys.details(), id],
};

export const useContactsQuery = (params = {}) => useQuery({
  queryKey: contactKeys.list(params),
  queryFn: () => getContactsRequest(params),
  placeholderData: previousData => previousData,
});

export const useContactQuery = contactId => useQuery({
  queryKey: contactKeys.detail(contactId),
  queryFn: () => getContactRequest(contactId),
  enabled: Boolean(contactId),
});

const invalidateContactRelated = async queryClient => Promise.all([
  queryClient.invalidateQueries({ queryKey: contactKeys.lists() }),
  queryClient.invalidateQueries({ queryKey: ["companies"] }),
  queryClient.invalidateQueries({ queryKey: ["leads"] }),
]);

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createContactRequest, onSuccess: () => invalidateContactRelated(queryClient) });
};

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContactRequest,
    onSuccess: async (response, variables) => {
      await invalidateContactRelated(queryClient);
      if (variables?.contactId) queryClient.setQueryData(contactKeys.detail(variables.contactId), response);
    },
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContactRequest,
    onSuccess: async (_response, contactId) => {
      queryClient.removeQueries({ queryKey: contactKeys.detail(contactId) });
      await invalidateContactRelated(queryClient);
    },
  });
};