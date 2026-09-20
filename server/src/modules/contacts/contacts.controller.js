import {
  createContactSchema,
  listContactsSchema,
} from './contacts.validation.js';

import {
  createContact,
  listContacts,
} from './contacts.service.js';

export async function index(req, res) {
  const result = listContactsSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid search or pagination parameters.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  res.json(await listContacts(req.user, result.data));
}

export async function create(req, res) {
  const result = createContactSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Please check the contact information.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const contact = await createContact(req.user, result.data);

    res.status(201).json({
      message: 'Contact created successfully.',
      data: contact,
    });
  } catch (error) {
    if (error.code === 'CONTACT_COMPANY_FORBIDDEN') {
      return res.status(404).json({
        message: error.message,
      });
    }

    throw error;
  }
}