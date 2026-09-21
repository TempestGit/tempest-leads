import {
  completeFollowUpSchema,
  followUpIdSchema,
  listFollowUpsSchema,
  rescheduleFollowUpSchema,
} from './followUps.validation.js';

import {
  completeFollowUp,
  getFollowUp,
  listFollowUps,
  rescheduleFollowUp,
} from './followUps.service.js';

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

function handleMutationError(error, res, next) {
  switch (error.code) {
    case 'FOLLOW_UP_ACTOR_INACTIVE':
      return res.status(401).json({
        code: error.code,
        message: 'Your account is not active. Sign in again.',
      });

    case 'FOLLOW_UP_FORBIDDEN':
      return res.status(403).json({
        code: error.code,
        message: 'You do not have permission to change follow-ups.',
      });

    case 'FOLLOW_UP_NOT_FOUND':
      return res.status(404).json({
        code: error.code,
        message: 'Follow-up not found or you do not have access.',
      });

    case 'FOLLOW_UP_CONFLICT':
      return res.status(409).json({
        code: error.code,
        message:
          'This follow-up has already changed. Reload its latest details before continuing.',
      });

    case 'FOLLOW_UP_LEAD_CLOSED':
      return res.status(409).json({
        code: error.code,
        message:
          'This lead is not open for follow-up changes.',
      });

    case 'FOLLOW_UP_OWNER_INVALID':
      return res.status(409).json({
        code: error.code,
        message:
          'The lead must have an active owner before continuing.',
      });

    case 'FOLLOW_UP_CONTACT_INVALID':
      return res.status(409).json({
        code: error.code,
        message:
          'The follow-up contact no longer belongs to this company.',
      });

    case 'FOLLOW_UP_VERSION_LIMIT':
      return res.status(409).json({
        code: error.code,
        message:
          'The lead has reached its record version limit. Contact your administrator.',
      });

    case 'FOLLOW_UP_INVALID_TIME':
      return fieldError(
        res,
        'next_follow_up_at',
        'Choose a valid future follow-up date and time with an explicit timezone.',
        error.code,
      );

    case 'FOLLOW_UP_UNCHANGED_TIME':
      return fieldError(
        res,
        'next_follow_up_at',
        'Choose a different time when rescheduling.',
        error.code,
      );

    default:
      return next(error);
  }
}

/*
 * GET /api/follow-ups
 */
export async function index(req, res, next) {
  try {
    const parsed = listFollowUpsSchema.safeParse(req.query);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const result = await listFollowUps(req.user, parsed.data);

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
 * GET /api/follow-ups/:id
 */
export async function show(req, res, next) {
  try {
    const parsed = followUpIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid follow-up ID.',
      });
    }

    const followUp = await getFollowUp(req.user, parsed.data);

    if (!followUp) {
      return res.status(404).json({
        message: 'Follow-up not found or you do not have access.',
      });
    }

    return res.json({
      data: followUp,
    });
  } catch (error) {
    return next(error);
  }
}

/*
 * POST /api/follow-ups/:id/complete
 */
export async function complete(req, res, next) {
  try {
    const parsedId = followUpIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: 'Invalid follow-up ID.',
      });
    }

    const parsedBody = completeFollowUpSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return validationError(res, parsedBody.error);
    }

    const result = await completeFollowUp(
      req.user,
      parsedId.data,
      parsedBody.data,
    );

    return res.json({
      message: 'Follow-up completed and the next action scheduled.',
      data: result,
    });
  } catch (error) {
    return handleMutationError(error, res, next);
  }
}

/*
 * POST /api/follow-ups/:id/reschedule
 */
export async function reschedule(req, res, next) {
  try {
    const parsedId = followUpIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: 'Invalid follow-up ID.',
      });
    }

    const parsedBody = rescheduleFollowUpSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return validationError(res, parsedBody.error);
    }

    const result = await rescheduleFollowUp(
      req.user,
      parsedId.data,
      parsedBody.data,
    );

    return res.json({
      message: 'Follow-up rescheduled. The previous schedule was preserved.',
      data: result,
    });
  } catch (error) {
    return handleMutationError(error, res, next);
  }
}