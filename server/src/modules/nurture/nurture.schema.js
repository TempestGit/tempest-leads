import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

export const NURTURE_CATEGORIES = [
  "LATER",
  "NO_RESPONSE",
  "LOST_NOT_INTERESTED",
  "FUTURE_OPPORTUNITY",
];

/*
|--------------------------------------------------------------------------
| Communication Status
|--------------------------------------------------------------------------
*/

export const COMMUNICATION_STATUSES = [
  "NOT_CONTACTED",
  "CONTACTED",
  "ENGAGED",
  "NO_RESPONSE",
  "DO_NOT_CONTACT",
];

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const nurtureListSchema =
  z.object({
    category:
      z
        .enum(
          NURTURE_CATEGORIES
        )
        .optional(),

    search:
      z
        .string()
        .trim()
        .max(200)
        .optional(),

    page:
      z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
  });

/*
|--------------------------------------------------------------------------
| Lead ID
|--------------------------------------------------------------------------
*/

export const nurtureLeadIdSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| Update Nurture Profile
|--------------------------------------------------------------------------
*/

export const updateNurtureSchema =
  z.object({
    category:
      z
        .enum(
          NURTURE_CATEGORIES
        )
        .optional(),

    reason:
      z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),

    buyingStage:
      z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional(),

    communicationStatus:
      z
        .enum(
          COMMUNICATION_STATUSES
        )
        .optional(),

    reconnectAt:
      z.coerce
        .date()
        .nullable()
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Schedule Reconnect
|--------------------------------------------------------------------------
*/

export const scheduleReconnectSchema =
  z.object({
    action:
      z
        .string()
        .trim()
        .min(
          2,
          "Reconnect action is required."
        )
        .max(500)
        .default(
          "Reconnect"
        ),

    dueAt:
      z.coerce
        .date(),

    priority:
      z
        .enum([
          "High",
          "Medium",
          "Low",
        ])
        .default(
          "Medium"
        ),

    notes:
      z
        .string()
        .trim()
        .max(5000)
        .nullable()
        .optional(),
  });