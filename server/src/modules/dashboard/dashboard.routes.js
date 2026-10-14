import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getDashboardController } from "./dashboard.controller.js";
const router = Router();
router.use(authMiddleware);
router.get("/", asyncHandler(getDashboardController));
export default router;
