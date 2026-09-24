import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Format Zod Errors
|--------------------------------------------------------------------------
*/

const formatZodIssues = (
  issues = [],
  source = ""
) => {
  return issues.map(
    (issue) => {
      const path =
        Array.isArray(
          issue.path
        )
          ? issue.path.join(
              "."
            )
          : "";

      return {
        field: path
          ? `${source}.${path}`
          : source ||
            null,

        message:
          issue.message ||
          "Invalid value.",

        code:
          issue.code ||
          "validation_error",
      };
    }
  );
};

/*
|--------------------------------------------------------------------------
| Validate One Section
|--------------------------------------------------------------------------
*/

const validateSection = (
  schema,
  value,
  source
) => {
  const result =
    schema.safeParse(
      value
    );

  if (!result.success) {
    throw new ApiError(
      422,
      "Validation failed.",
      formatZodIssues(
        result.error.issues,
        source
      ),
      "VALIDATION_ERROR"
    );
  }

  return result.data;
};

/*
|--------------------------------------------------------------------------
| Validation Middleware
|--------------------------------------------------------------------------
*/

const validateMiddleware =
  ({
    body,
    params,
    query,
  } = {}) =>
  (req, res, next) => {
    try {
      req.validated =
        req.validated || {};

      /*
      |--------------------------------------------------------------------------
      | Body
      |--------------------------------------------------------------------------
      */

      if (body) {
        const parsed =
          validateSection(
            body,
            req.body,
            "body"
          );

        req.body =
          parsed;

        req.validated.body =
          parsed;
      }

      /*
      |--------------------------------------------------------------------------
      | Params
      |--------------------------------------------------------------------------
      */

      if (params) {
        req.validated.params =
          validateSection(
            params,
            req.params,
            "params"
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Query
      |--------------------------------------------------------------------------
      |
      | Express 5 exposes req.query through a getter.
      | Don't assign req.query directly.
      |
      */

      if (query) {
        req.validated.query =
          validateSection(
            query,
            req.query,
            "query"
          );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateMiddleware;