import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  listNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
  clearNotificationsController,
} from "./notifications.controller.js";

const router = Router();

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.use(authMiddleware);

router.get(
  "/",
  asyncRoute(listNotificationsController)
);

router.patch(
  "/read-all",
  asyncRoute(markAllNotificationsReadController)
);

router.patch(
  "/:notificationId/read",
  asyncRoute(markNotificationReadController)
);

// Clear all notifications for the logged-in user.
router.delete(
  "/",
  asyncRoute(clearNotificationsController)
);

// Keep individual deletion for existing consumers.
router.delete(
  "/:notificationId",
  asyncRoute(deleteNotificationController)
);

export default router;