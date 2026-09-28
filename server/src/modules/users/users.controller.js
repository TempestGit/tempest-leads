import {
  createUserService,
  getUserOptionsService,
  listUsersService,
  updateUserService,
  updateUserStatusService,
} from "./users.service.js";

const metadata = (
  req
) => ({
  ipAddress:
    req.ip ||
    null,

  userAgent:
    req.get(
      "user-agent"
    ) ||
    null,
});

export const getUserOptionsController =
  async (
    req,
    res
  ) => {
    const result =
      await getUserOptionsService(
        req.user
      );

    res.status(200).json({
      success: true,
      data:
        result,
    });
  };

export const listUsersController =
  async (
    req,
    res
  ) => {
    const result =
      await listUsersService(
        req.validated
          ?.query ||
          {},
        req.user
      );

    res.status(200).json({
      success: true,
      data:
        result,
    });
  };

export const createUserController =
  async (
    req,
    res
  ) => {
    const user =
      await createUserService({
        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(201).json({
      success: true,

      message:
        "User created successfully.",

      data: {
        user,
      },
    });
  };

export const updateUserController =
  async (
    req,
    res
  ) => {
    const user =
      await updateUserService({
        userId:
          req.validated
            .params
            .userId,

        data:
          req.validated.body,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(200).json({
      success: true,

      message:
        "User updated successfully.",

      data: {
        user,
      },
    });
  };

export const updateUserStatusController =
  async (
    req,
    res
  ) => {
    const result =
      await updateUserStatusService({
        userId:
          req.validated
            .params
            .userId,

        status:
          req.validated
            .body
            .status,

        currentUser:
          req.user,

        ...metadata(req),
      });

    res.status(200).json({
      success: true,

      message:
        result.user.status ===
        "ACTIVE"
          ? "User activated successfully."
          : "User deactivated successfully.",

      data:
        result,
    });
  };