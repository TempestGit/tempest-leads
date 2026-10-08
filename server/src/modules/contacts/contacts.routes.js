import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import validateMiddleware from "../../middleware/validate.middleware.js";
import { contactIdSchema, contactListSchema, createContactSchema, updateContactSchema } from "./contacts.schema.js";
import { createContactController, deleteContactController, getContactController, listContactsController, updateContactController } from "./contacts.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", validateMiddleware({ query: contactListSchema }), asyncHandler(listContactsController));
router.get("/:contactId", validateMiddleware({ params: contactIdSchema }), asyncHandler(getContactController));
router.post("/", validateMiddleware({ body: createContactSchema }), asyncHandler(createContactController));
router.patch("/:contactId", validateMiddleware({ params: contactIdSchema, body: updateContactSchema }), asyncHandler(updateContactController));
router.delete("/:contactId", validateMiddleware({ params: contactIdSchema }), asyncHandler(deleteContactController));
export default router;