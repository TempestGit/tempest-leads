import {
  createMeetingSchema,
  listMeetingsSchema,
  meetingIdSchema,
} from './meetings.validation.js';

import {
  createMeeting,
  getMeeting,
  listMeetings,
} from './meetings.service.js';

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
 * GET /api/meetings
 */
export async function index(req, res, next) {
  try {
    const parsed = listMeetingsSchema.safeParse(req.query);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const result = await listMeetings(req.user, parsed.data);

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
 * GET /api/meetings/:id
 */
export async function show(req, res, next) {
  try {
    const parsed = meetingIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid meeting ID.',
      });
    }

    const meeting = await getMeeting(req.user, parsed.data);

    if (!meeting) {
      return res.status(404).json({
        message: 'Meeting not found or you do not have access.',
      });
    }

    return res.json({
      data: meeting,
    });
  } catch (error) {
    return next(error);
  }
}

/*
 * POST /api/meetings
 */
export async function create(req, res, next) {
  try {
    const parsed = createMeetingSchema.safeParse(req.body);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const meeting = await createMeeting(req.user, parsed.data);

    return res.status(201).json({
      data: meeting,
    });
  } catch (error) {
    switch (error.code) {
      case 'MEETING_ACTOR_INACTIVE':
        return res.status(401).json({
          code: error.code,
          message: 'Your account is not active. Sign in again.',
        });

      case 'MEETING_CREATE_FORBIDDEN':
        return res.status(403).json({
          code: error.code,
          message: 'You do not have permission to schedule meetings.',
        });

      case 'MEETING_LEAD_FORBIDDEN':
        return res.status(404).json({
          code: error.code,
          message: 'Lead not found or you do not have access.',
        });

      case 'MEETING_LEAD_CLOSED':
        return res.status(409).json({
          code: error.code,
          message:
            'Schedule meetings only for open or nurture leads.',
        });

      case 'MEETING_OWNER_INVALID':
        return res.status(409).json({
          code: error.code,
          message: 'The lead must have an active owner.',
        });

      case 'MEETING_CONTACT_INVALID':
        return fieldError(
          res,
          'contact_id',
          'Select a contact belonging to the lead’s company.',
          error.code,
        );

      case 'MEETING_PARTICIPANTS_INVALID':
        return fieldError(
          res,
          'participants',
          'Check the participant selection. Users must be active, and contacts must belong to the lead’s company. Select at most 100 additional participants.',
          error.code,
        );

      case 'MEETING_INVALID_TIME':
        return fieldError(
          res,
          'starts_at',
          'Enter valid timezone-qualified meeting times: the start must be in the future, and the end must be after the start.',
          error.code,
        );

      default:
        return next(error);
    }
  }
}