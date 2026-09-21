import {
  contactIdSchema,
  createContactSchema,
  listContactsSchema,
  updateContactSchema,
} from './contacts.validation.js';

import {
  createContact,
  getContact,
  listContacts,
  updateContact,
} from './contacts.service.js';

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

function contactNotFound(res) {
  return res.status(404).json({
    message: 'Contact not found or you do not have access.',
  });
}

/*
 * GET /api/contacts
 */
export async function index(req, res, next) {
  try {
    const parsed = listContactsSchema.safeParse(req.query);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const result = await listContacts(req.user, parsed.data);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

/*
 * POST /api/contacts
 */
export async function create(req, res, next) {
  try {
    const parsed = createContactSchema.safeParse(req.body);

    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const contact = await createContact(req.user, parsed.data);

    return res.status(201).json({
      data: contact,
    });
  } catch (error) {
    if (error.code === 'CONTACT_COMPANY_FORBIDDEN') {
      return res.status(404).json({
        message: 'Company not found or you do not have access.',
      });
    }

    return next(error);
  }
}

/*
 * GET /api/contacts/:id
 */
export async function show(req, res, next) {
  try {
    const parsedId = contactIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: 'Invalid contact ID.',
      });
    }

    const contact = await getContact(req.user, parsedId.data);

    if (!contact) {
      return contactNotFound(res);
    }

    return res.json({
      data: contact,
    });
  } catch (error) {
    return next(error);
  }
}

/*
 * PUT /api/contacts/:id
 */
export async function update(req, res, next) {
  try {
    const parsedId = contactIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        message: 'Invalid contact ID.',
      });
    }

    const parsedBody = updateContactSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return validationError(res, parsedBody.error);
    }

    const result = await updateContact(
      req.user,
      parsedId.data,
      parsedBody.data,
    );

    if (result.status === 'not_found') {
      return contactNotFound(res);
    }

    if (result.status === 'conflict') {
      return res.status(409).json({
        code: 'CONTACT_VERSION_CONFLICT',
        message:
          'This contact was updated after you opened it. Reload the latest details before editing again.',
      });
    }

    if (result.status !== 'updated' || !result.contact) {
      throw new Error('Unexpected contact update result.');
    }

    return res.json({
      data: result.contact,
    });
  } catch (error) {
    return next(error);
  }
}