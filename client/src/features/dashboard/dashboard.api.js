import apiClient from "../../lib/apiClient.js";
export const getDashboardRequest = async () => (await apiClient.get("/dashboard")).data.data;
