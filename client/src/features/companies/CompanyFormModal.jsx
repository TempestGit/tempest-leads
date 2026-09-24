import {
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  COMPANY_INDUSTRIES,
  companyFormSchema,
  defaultCompanyValues,
} from "./companies.schema.js";

import {
  useCreateCompanyMutation,
} from "./companies.queries.js";

/*
|--------------------------------------------------------------------------
| Field Error
|--------------------------------------------------------------------------
*/

const FieldError = ({
  message,
}) => {
  if (!message) {
    return null;
  }

  return (
    <span className="form-error">
      {message}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| Company Form Modal
|--------------------------------------------------------------------------
|
| Matches prototype:
|
| Company name *
| Industry *
| City
| Website
| Existing agency
|
*/

const CompanyFormModal = ({
  open,
  onClose,
}) => {
  const createMutation =
    useCreateCompanyMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        companyFormSchema
      ),

    defaultValues:
      defaultCompanyValues,
  });

  /*
  |--------------------------------------------------------------------------
  | Reset each time modal opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (open) {
      reset(
        defaultCompanyValues
      );
    }
  }, [
    open,
    reset,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Escape Key
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    open,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  const busy =
    isSubmitting ||
    createMutation.isPending;

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async (values) => {
      try {
        await createMutation.mutateAsync(
          values
        );

        reset(
          defaultCompanyValues
        );

        onClose();
      } catch (error) {
        const response =
          error?.response
            ?.data;

        if (
          response?.code ===
          "COMPANY_ALREADY_EXISTS"
        ) {
          setError("name", {
            type: "server",

            message:
              "Possible existing company found.",
          });

          return;
        }

        setError("root", {
          type: "server",

          message:
            response?.message ||
            "Unable to create company.",
        });
      }
    };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
    >
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-company-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="add-company-title">
              Add company
            </h2>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              onClose
            }
            disabled={busy}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </header>

        <form
          onSubmit={
            handleSubmit(
              submit
            )
          }
        >
          {/* Body */}

          <div className="modal-body">
            {errors.root && (
              <div
                className="form-error"
                style={{
                  padding:
                    "8px 10px",
                  marginBottom:
                    "12px",
                  background:
                    "var(--crm-danger-soft)",
                  borderRadius:
                    "5px",
                }}
              >
                {
                  errors.root
                    .message
                }
              </div>
            )}

            <div className="form-section">
              <div className="form-grid2">
                {/* Company Name */}

                <label>
                  Company name *

                  <input
                    type="text"
                    {...register(
                      "name"
                    )}
                    placeholder=""
                    autoFocus
                  />

                  <FieldError
                    message={
                      errors.name
                        ?.message
                    }
                  />
                </label>

                {/* Industry */}

                <label>
                  Industry *

                  <select
                    {...register(
                      "industry"
                    )}
                  >
                    {COMPANY_INDUSTRIES.map(
                      (
                        industry
                      ) => (
                        <option
                          key={
                            industry
                          }
                          value={
                            industry
                          }
                        >
                          {
                            industry
                          }
                        </option>
                      )
                    )}
                  </select>

                  <FieldError
                    message={
                      errors.industry
                        ?.message
                    }
                  />
                </label>

                {/* City */}

                <label>
                  City

                  <input
                    type="text"
                    {...register(
                      "city"
                    )}
                  />

                  <FieldError
                    message={
                      errors.city
                        ?.message
                    }
                  />
                </label>

                {/* Website */}

                <label>
                  Website

                  <input
                    type="text"
                    {...register(
                      "website"
                    )}
                  />

                  <FieldError
                    message={
                      errors.website
                        ?.message
                    }
                  />
                </label>

                {/* Existing Agency */}

                <label>
                  Existing agency

                  <input
                    type="text"
                    {...register(
                      "agencyRelationship"
                    )}
                  />

                  <FieldError
                    message={
                      errors
                        .agencyRelationship
                        ?.message
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}

          <footer className="modal-foot">
            <button
              type="button"
              className="tl-secondary"
              onClick={
                onClose
              }
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="tl-primary"
              disabled={busy}
            >
              {busy && (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
              )}

              {busy
                ? "Creating..."
                : "Create company"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default CompanyFormModal;