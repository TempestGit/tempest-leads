
import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  listNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
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

router.delete(
  "/:notificationId",
  asyncRoute(deleteNotificationController)
);

export default router;