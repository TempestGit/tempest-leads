import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| Get Contacts
|--------------------------------------------------------------------------
*/

export const getContactsRequest =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/contacts",
        {
          params,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get Contact
|--------------------------------------------------------------------------
*/

export const getContactRequest =
  async (contactId) => {
    const response =
      await apiClient.get(
        `/contacts/${contactId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Create Contact
|--------------------------------------------------------------------------
*/

export const createContactRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/contacts",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Contact
|--------------------------------------------------------------------------
*/

export const updateContactRequest =
  async ({
    contactId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/contacts/${contactId}`,
        data
      );

    return response.data;
  };