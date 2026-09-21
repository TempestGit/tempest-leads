import {
  activityIdSchema,
  createActivitySchema,
  listActivitiesSchema,
} from './activities.validator.js';

import {
  createActivity,
  getActivity,
  listActivities,
} from './activities.service.js';

function validationError(res, error) {
  const errors = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_form';

    if (!errors[field]) {
      errors[field] = [];
    }

    errors[field].push(issue.message);
  }

  return res.status(400).json({
    message: 'Please check the submitted values.',
    errors,
  });
}

function fieldError(res, field, message, code) {
  return res.status(400).json({
    code,
    message,
    errors: {
      [field]: [message],
    },
  });
}

/*
 * GET /api/activities
 */
export async function index(req, res, next) {
  try {
    const parsed = listActivitiesSchema.safeParse(req.query);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const result = await listActivities(req.user, parsed.data);

    // A specifically requested lead is missing or inaccessible.
    if (result === null) {
      return res.status(404).json({
        message: 'Lead not found or you do not have access.',
      });
    }

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

/*
 * GET /api/activities/:id
 */
export async function show(req, res, next) {
  try {
    const parsed = activityIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid activity ID.',
      });
    }

    const activity = await getActivity(req.user, parsed.data);

    if (!activity) {
      return res.status(404).json({
        message: 'Activity not found or you do not have access.',
      });
    }

    return res.json({
      data: activity,
    });
  } catch (error) {
    return next(error);
  }
}

/*
 * POST /api/activities
 */
export async function create(req, res, next) {
  try {
    const parsed = createActivitySchema.safeParse(req.body);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const activity = await createActivity(req.user, parsed.data);

    return res.status(201).json({
      data: activity,
    });
  } catch (error) {
    switch (error.code) {
      case 'ACTIVITY_ACTOR_INACTIVE':
        return res.status(401).json({
          code: error.code,
          message: 'Your account is not active. Sign in again.',
        });

      case 'ACTIVITY_CREATE_FORBIDDEN':
        return res.status(403).json({
          code: error.code,
          message: 'You do not have permission to record activities.',
        });

      case 'ACTIVITY_LEAD_FORBIDDEN':
        return res.status(404).json({
          code: error.code,
          message: 'Lead not found or you do not have access.',
        });

      case 'ACTIVITY_CONTACT_INVALID':
        return fieldError(
          res,
          'contact_id',
          'Select a contact belonging to the lead’s company.',
          error.code,
        );

      case 'ACTIVITY_TYPE_INVALID':
        return fieldError(
          res,
          'activity_type',
          'Select a valid activity type.',
          error.code,
        );

      case 'ACTIVITY_DIRECTION_INVALID':
        return fieldError(
          res,
          'direction',
          'Use Inbound or Outbound, or leave direction empty for internal activities. Notes must have no direction.',
          error.code,
        );

      case 'ACTIVITY_INVALID_TIME':
        return fieldError(
          res,
          'occurred_at',
          'Enter a valid activity time with a timezone. It cannot be in the future.',
          error.code,
        );

      case 'ACTIVITY_CONTENT_REQUIRED':
        return fieldError(
          res,
          'notes',
          'Enter an activity subject or notes.',
          error.code,
        );

      default:
        // Unexpected database errors go to the central error handler.
        return next(error);
    }
  }
}