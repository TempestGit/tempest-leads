import ApiError from "../utils/ApiError.js";

const notFoundMiddleware = (req, res, next) => {
  next(
    new ApiError(
      404,
      `API route not found: ${req.method} ${req.originalUrl}`,
      [],
      "ROUTE_NOT_FOUND"
    )
  );
};

export default notFoundMiddleware;