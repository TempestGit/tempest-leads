import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| Get Companies
|--------------------------------------------------------------------------
*/

export const getCompaniesRequest =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/companies",
        {
          params,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get Company
|--------------------------------------------------------------------------
*/

export const getCompanyRequest =
  async (companyId) => {
    const response =
      await apiClient.get(
        `/companies/${companyId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Create Company
|--------------------------------------------------------------------------
*/

export const createCompanyRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/companies",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Company
|--------------------------------------------------------------------------
*/

export const updateCompanyRequest =
  async ({
    companyId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/companies/${companyId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Delete Company
|--------------------------------------------------------------------------
*/

export const deleteCompanyRequest =
  async (companyId) => {
    const response =
      await apiClient.delete(
        `/companies/${companyId}`
      );

    return response.data;
  };