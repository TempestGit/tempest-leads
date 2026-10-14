import { getDashboardData } from "./dashboard.repository.js";
export const getDashboardController = async (req, res) => {
  const data = await getDashboardData(req.user);
  res.status(200).json({ success: true, data });
};
