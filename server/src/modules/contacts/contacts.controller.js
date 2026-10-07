import {
  createContactService,
  getContactService,
  getContactsService,
  updateContactService,
} from "./contacts.service.js";

/*
|--------------------------------------------------------------------------
| Request Metadata
|--------------------------------------------------------------------------
*/

const getRequestMetadata =
  (req) => ({
    ipAddress:
      req.ip || null,

    userAgent:
      req.get(
        "user-agent"
      ) || null,
  });

/*
|--------------------------------------------------------------------------
| GET /api/contacts
|--------------------------------------------------------------------------
*/

export const listContactsController =
  async (req, res) => {
    const result =
      await getContactsService(
        req.validated.query,
        req.user
      );

    res.status(200).json({
      success: true,

      data: result,
    });
  };

/*
|--------------------------------------------------------------------------
| GET /api/contacts/:contactId
|--------------------------------------------------------------------------
*/

export const getContactController =
  async (req, res) => {
    const {
      contactId,
    } =
      req.validated.params;

    const contact =
      await getContactService(
        contactId,
        req.user
      );

    res.status(200).json({
      success: true,

      data: {
        contact,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| POST /api/contacts
|--------------------------------------------------------------------------
*/

export const createContactController =
  async (req, res) => {
    const contact =
      await createContactService({
        data:
          req.validated.body,

        currentUser:
          req.user,

        userId:
          req.user.id,

        ...getRequestMetadata(
          req
        ),
      });

    res.status(201).json({
      success: true,

      message:
        "Contact created.",

      data: {
        contact,
      },
    });
  };

/*
|--------------------------------------------------------------------------
| PATCH /api/contacts/:contactId
|--------------------------------------------------------------------------
*/

export const updateContactController =
  async (req, res) => {
    const {
      contactId,
    } =
      req.validated.params;

    const contact =
      await updateContactService({
        contactId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        userId:
          req.user.id,

        ...getRequestMetadata(
          req
        ),
      });

    res.status(200).json({
      success: true,

      message:
        "Contact updated.",

      data: {
        contact,
      },
    });
  };