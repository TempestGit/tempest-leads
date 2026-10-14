import { useQuery } from "@tanstack/react-query";
import { getDashboardRequest } from "./dashboard.api.js";
export const useDashboardQuery = () => useQuery({
  queryKey: ["dashboard", "overview"], queryFn: getDashboardRequest, staleTime: 60000,
});
