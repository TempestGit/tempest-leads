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
  useCompaniesQuery,
} from "../companies/companies.queries.js";

import {
  useCreateContactMutation,
} from "./contacts.queries.js";

import {
  contactFormSchema,
  defaultContactValues,
} from "./contacts.schema.js";

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
| Add Contact Modal
|--------------------------------------------------------------------------
*/

const ContactFormModal = ({
  open,
  onClose,
}) => {
  const createMutation =
    useCreateContactMutation();

  /*
  |--------------------------------------------------------------------------
  | Companies For Dropdown
  |--------------------------------------------------------------------------
  */

  const {
    data:
      companiesResponse,

    isLoading:
      companiesLoading,
  } =
    useCompaniesQuery({
      page: 1,
      limit: 100,
      sort: "name",
      direction: "asc",
    });

  const companies =
    companiesResponse
      ?.data
      ?.companies || [];

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

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
        contactFormSchema
      ),

    defaultValues:
      defaultContactValues,
  });

  /*
  |--------------------------------------------------------------------------
  | Reset When Opened
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (open) {
      reset(
        defaultContactValues
      );
    }
  }, [
    open,
    reset,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Escape
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
          defaultContactValues
        );

        onClose();
      } catch (error) {
        setError(
          "root",
          {
            type: "server",

            message:
              error?.response
                ?.data
                ?.message ||
              "Unable to create contact.",
          }
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-contact-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="add-contact-title">
              Add contact
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
                className="error-box"
                style={{
                  marginBottom:
                    "12px",
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
                {/* Company */}

                <label>
                  Company *

                  <select
                    {...register(
                      "companyId"
                    )}
                    disabled={
                      companiesLoading
                    }
                  >
                    <option value="">
                      {companiesLoading
                        ? "Loading companies..."
                        : "Select company"}
                    </option>

                    {companies.map(
                      (
                        company
                      ) => (
                        <option
                          key={
                            company.id
                          }
                          value={
                            company.id
                          }
                        >
                          {
                            company.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  <FieldError
                    message={
                      errors.companyId
                        ?.message
                    }
                  />
                </label>

                {/* Name */}

                <label>
                  Name *

                  <input
                    type="text"
                    {...register(
                      "name"
                    )}
                    autoFocus
                  />

                  <FieldError
                    message={
                      errors.name
                        ?.message
                    }
                  />
                </label>

                {/* Designation */}

                <label>
                  Designation

                  <input
                    type="text"
                    {...register(
                      "designation"
                    )}
                  />

                  <FieldError
                    message={
                      errors.designation
                        ?.message
                    }
                  />
                </label>

                {/* Phone */}

                <label>
                  Phone

                  <input
                    type="tel"
                    {...register(
                      "phone"
                    )}
                  />

                  <FieldError
                    message={
                      errors.phone
                        ?.message
                    }
                  />
                </label>

                {/* Email */}

                <label>
                  Email

                  <input
                    type="email"
                    {...register(
                      "email"
                    )}
                  />

                  <FieldError
                    message={
                      errors.email
                        ?.message
                    }
                  />
                </label>

                {/* Decision Maker */}

                <label>
                  Decision maker

                  <select
                    {...register(
                      "isDecisionMaker"
                    )}
                  >
                    <option value="false">
                      No
                    </option>

                    <option value="true">
                      Yes
                    </option>
                  </select>

                  <FieldError
                    message={
                      errors
                        .isDecisionMaker
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
              disabled={
                busy ||
                companiesLoading
              }
            >
              {busy && (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
              )}

              {busy
                ? "Creating..."
                : "Create contact"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default ContactFormModal;