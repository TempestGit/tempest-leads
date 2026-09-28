import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUserOptionsQuery,
} from "./users.queries.js";

/*
|--------------------------------------------------------------------------
| Empty Form
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "OWNER",
  department: "",
  location: "",
  branchId: "",
};

/*
|--------------------------------------------------------------------------
| User Form Modal
|--------------------------------------------------------------------------
*/

const UserFormModal = ({
  open,
  user = null,
  onClose,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const optionsQuery =
    useUserOptionsQuery(
      open
    );

  /*
  |--------------------------------------------------------------------------
  | Mutations
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useCreateUserMutation();

  const updateMutation =
    useUpdateUserMutation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Mode
  |--------------------------------------------------------------------------
  */

  const isEditing =
    Boolean(
      user?.id
    );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  /*
  |--------------------------------------------------------------------------
  | Options
  |--------------------------------------------------------------------------
  */

  const options =
    optionsQuery.data
      ?.data ||
    {};

  const branches =
    options.branches ||
    [];

  const roles =
    options.roles?.length
      ? options.roles
      : [
          {
            value:
              "OWNER",

            label:
              "User / Owner",
          },

          {
            value:
              "SUPER_ADMIN",

            label:
              "Super Admin",
          },
        ];

  /*
  |--------------------------------------------------------------------------
  | Selected Branch
  |--------------------------------------------------------------------------
  */

  const selectedBranch =
    useMemo(
      () =>
        branches.find(
          (
            branch
          ) =>
            Number(
              branch.id
            ) ===
            Number(
              form.branchId
            )
        ) ||
        null,
      [
        branches,
        form.branchId,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setShowPassword(
      false
    );

    if (user) {
      setForm({
        fullName:
          user.fullName ||
          "",

        email:
          user.email ||
          "",

        password:
          "",

        role:
          user.role ||
          "OWNER",

        department:
          user.department ||
          "",

        location:
          user.location ||
          "",

        branchId:
          user.branchId
            ? String(
                user.branchId
              )
            : "",
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
    });
  }, [
    open,
    user,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Change Field
  |--------------------------------------------------------------------------
  */

  const updateField =
    (
      field,
      value
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            value,
        })
      );

      if (error) {
        setError("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Role Change
  |--------------------------------------------------------------------------
  */

  const handleRoleChange =
    (
      role
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          role,

          /*
           * Super Admin is global.
           * Remove branch when switching
           * from Owner to Super Admin.
           */
          branchId:
            role ===
            "SUPER_ADMIN"
              ? ""
              : previous
                  .branchId,
        })
      );

      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose =
    () => {
      if (isSaving) {
        return;
      }

      setError("");
      setShowPassword(
        false
      );

      onClose();
    };

  /*
  |--------------------------------------------------------------------------
  | Validate
  |--------------------------------------------------------------------------
  */

  const validateForm =
    () => {
      const fullName =
        form.fullName
          .trim();

      const email =
        form.email
          .trim();

      if (!fullName) {
        return (
          "Full name is required."
        );
      }

      if (
        fullName.length <
        2
      ) {
        return (
          "Full name must contain at least 2 characters."
        );
      }

      if (!email) {
        return (
          "Email is required."
        );
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          email
        )
      ) {
        return (
          "Enter a valid email address."
        );
      }

      if (
        ![
          "OWNER",
          "SUPER_ADMIN",
        ].includes(
          form.role
        )
      ) {
        return (
          "Select a valid role."
        );
      }

      if (
        form.role ===
          "OWNER" &&
        !form.branchId
      ) {
        return (
          "Branch is required for an Owner."
        );
      }

      if (
        !isEditing &&
        !form.password
      ) {
        return (
          "Password is required."
        );
      }

      if (
        form.password &&
        form.password.length <
          8
      ) {
        return (
          "Password must contain at least 8 characters."
        );
      }

      if (
        form.password.length >
        128
      ) {
        return (
          "Password is too long."
        );
      }

      return "";
    };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Payload
      |--------------------------------------------------------------------------
      */

      const data = {
        fullName:
          form.fullName
            .trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        role:
          form.role,

        department:
          form.department
            .trim() ||
          null,

        location:
          form.location
            .trim() ||
          null,

        /*
         * Owners must have a branch.
         * Super Admin remains global.
         */
        branchId:
          form.role ===
          "OWNER"
            ? Number(
                form.branchId
              )
            : null,
      };

      /*
       * On edit, blank password means:
       * keep current password.
       */
      if (
        form.password
      ) {
        data.password =
          form.password;
      }

      try {
        if (isEditing) {
          await updateMutation
            .mutateAsync({
              userId:
                Number(
                  user.id
                ),

              data,
            });
        } else {
          await createMutation
            .mutateAsync({
              ...data,

              password:
                form.password,
            });
        }

        onClose();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            requestError
              ?.message ||
            "Unable to save user."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Not Open
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSaving
        ) {
          handleClose();
        }
      }}
    >
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <header className="modal-head">
          <div>
            <h2
              id="user-modal-title"
            >
              {isEditing
                ? "Edit user"
                : "Add user"}
            </h2>

            <p>
              Manage account access,
              lead ownership and
              primary branch.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              handleClose
            }
            disabled={
              isSaving
            }
            aria-label="Close"
          >
            <X
              size={16}
            />
          </button>
        </header>

        {/* --------------------------------------------------------------- */}
        {/* Body */}
        {/* --------------------------------------------------------------- */}

        <div className="modal-body">
          {/* ------------------------------------------------------------- */}
          {/* API / Validation Error */}
          {/* ------------------------------------------------------------- */}

          {error && (
            <div
              className="error-box"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Options Error */}
          {/* ------------------------------------------------------------- */}

          {optionsQuery.isError && (
            <div
              className="error-box"
              role="alert"
            >
              {optionsQuery.error
                ?.response
                ?.data
                ?.message ||
                "Unable to load user options."}

              <button
                type="button"
                className="tl-link"
                onClick={() =>
                  optionsQuery
                    .refetch()
                }
              >
                Retry
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* User Information */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              User information
            </h3>

            <div className="form-grid2">
              {/* Full Name */}

              <label>
                Full name *

                <input
                  type="text"
                  value={
                    form.fullName
                  }
                  maxLength={150}
                  autoComplete="name"
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "fullName",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              {/* Email */}

              <label>
                Email *

                <input
                  type="email"
                  value={
                    form.email
                  }
                  maxLength={190}
                  autoComplete="email"
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "email",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              {/* Role */}

              <label>
                Role *

                <select
                  value={
                    form.role
                  }
                  disabled={
                    isSaving ||
                    optionsQuery
                      .isLoading
                  }
                  onChange={(
                    event
                  ) =>
                    handleRoleChange(
                      event.target
                        .value
                    )
                  }
                >
                  {roles.map(
                    (
                      role
                    ) => (
                      <option
                        key={
                          role.value
                        }
                        value={
                          role.value
                        }
                      >
                        {
                          role.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Branch */}

              <label>
                Primary branch
                {form.role ===
                "OWNER"
                  ? " *"
                  : ""}

                <select
                  value={
                    form.branchId
                  }
                  disabled={
                    isSaving ||
                    optionsQuery
                      .isLoading ||
                    form.role ===
                      "SUPER_ADMIN"
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "branchId",
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    {form.role ===
                    "SUPER_ADMIN"
                      ? "Global access"
                      : optionsQuery
                            .isLoading
                        ? "Loading branches..."
                        : "Select branch"}
                  </option>

                  {branches.map(
                    (
                      branch
                    ) => (
                      <option
                        key={
                          branch.id
                        }
                        value={
                          String(
                            branch.id
                          )
                        }
                      >
                        {
                          branch.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Department */}

              <label>
                Department

                <input
                  type="text"
                  value={
                    form.department
                  }
                  maxLength={120}
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "department",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              {/* Location */}

              <label>
                Location

                <input
                  type="text"
                  value={
                    form.location
                  }
                  maxLength={120}
                  disabled={
                    isSaving
                  }
                  placeholder="e.g. Hyderabad"
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "location",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Branch Summary */}
          {/* ------------------------------------------------------------- */}

          {form.role ===
            "OWNER" &&
            selectedBranch && (
              <div className="brief-clarification">
                <b>
                  Primary branch
                </b>

                <span>
                  {selectedBranch.name}

                  {selectedBranch.code
                    ? ` (${selectedBranch.code})`
                    : ""}
                </span>
              </div>
            )}

          {/* ------------------------------------------------------------- */}
          {/* Super Admin Notice */}
          {/* ------------------------------------------------------------- */}

          {form.role ===
            "SUPER_ADMIN" && (
            <div className="brief-clarification">
              <b>
                Global access
              </b>

              <span>
                Super Admin does not
                require a primary
                branch and can manage
                records across all
                branches.
              </span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Password */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Security
            </h3>

            <div className="form-grid2">
              <label>
                {isEditing
                  ? "New password"
                  : "Password *"}

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      form.password
                    }
                    maxLength={128}
                    autoComplete={
                      isEditing
                        ? "new-password"
                        : "new-password"
                    }
                    disabled={
                      isSaving
                    }
                    placeholder={
                      isEditing
                        ? "Leave blank to keep current password"
                        : "Minimum 8 characters"
                    }
                    style={{
                      paddingRight:
                        "42px",
                    }}
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "password",
                        event.target
                          .value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="icon-control"
                    disabled={
                      isSaving
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    style={{
                      position:
                        "absolute",

                      right:
                        "6px",

                      top:
                        "50%",

                      transform:
                        "translateY(-50%)",

                      width:
                        "30px",

                      height:
                        "30px",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={15}
                      />
                    ) : (
                      <Eye
                        size={15}
                      />
                    )}
                  </button>
                </div>

                {isEditing && (
                  <small className="muted">
                    Leave blank to
                    keep the existing
                    password.
                  </small>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Footer */}
        {/* --------------------------------------------------------------- */}

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              handleClose
            }
            disabled={
              isSaving
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={
              submit
            }
            disabled={
              isSaving ||
              optionsQuery
                .isLoading
            }
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Update user"
                : "Create user"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default UserFormModal;