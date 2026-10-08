import apiClient from "../../lib/apiClient.js";

export const getContactsRequest = async (params = {}) => (await apiClient.get("/contacts", { params })).data;
export const getContactRequest = async contactId => (await apiClient.get(`/contacts/${contactId}`)).data;
export const createContactRequest = async data => (await apiClient.post("/contacts", data)).data;
export const updateContactRequest = async ({ contactId, data }) => (await apiClient.patch(`/contacts/${contactId}`, data)).data;
export const deleteContactRequest = async contactId => (await apiClient.delete(`/contacts/${contactId}`)).data;