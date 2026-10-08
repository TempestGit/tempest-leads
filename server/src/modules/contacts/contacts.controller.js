import { createContactService, deleteContactService, getContactService, getContactsService, updateContactService } from "./contacts.service.js";

const getRequestMetadata = req => ({ ipAddress: req.ip || null, userAgent: req.get("user-agent") || null });

export const listContactsController = async (req, res) => {
  const result = await getContactsService(req.validated.query, req.user);
  res.status(200).json({ success: true, data: result });
};

export const getContactController = async (req, res) => {
  const contact = await getContactService(req.validated.params.contactId, req.user);
  res.status(200).json({ success: true, data: { contact } });
};

export const createContactController = async (req, res) => {
  const contact = await createContactService({ data: req.validated.body, currentUser: req.user, userId: req.user.id, ...getRequestMetadata(req) });
  res.status(201).json({ success: true, message: "Contact created.", data: { contact } });
};

export const updateContactController = async (req, res) => {
  const contact = await updateContactService({ contactId: req.validated.params.contactId, data: req.validated.body, currentUser: req.user, userId: req.user.id, ...getRequestMetadata(req) });
  res.status(200).json({ success: true, message: "Contact updated.", data: { contact } });
};

export const deleteContactController = async (req, res) => {
  await deleteContactService({ contactId: req.validated.params.contactId, currentUser: req.user, userId: req.user.id, ...getRequestMetadata(req) });
  res.status(200).json({ success: true, message: "Contact deleted." });
};