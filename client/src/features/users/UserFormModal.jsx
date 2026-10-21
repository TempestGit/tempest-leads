
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  Building2,
  Check,
  KeyRound,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUserOptionsQuery,
} from "./users.queries.js";

import "./users-glass.css";

/*
|--------------------------------------------------------------------------
| Empty Form
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  fullName: "",
  email: "",
  role: "OWNER",
  department: "",
  location: "",
  branchId: "",
};

/*
|--------------------------------------------------------------------------
| Reusable Field
|--------------------------------------------------------------------------
*/

const FormField = ({
  label,
  required = false,
  hint,
  children,
  full = false,
}) => (
  <div className={`gum-field ${full ? "sm:col-span-2" : ""}`}>
    <label className="gum-label mb-2 block text-xs font-bold">
      {label}

      {required && (
        <span className="gum-required ml-1">*</span>
      )}
    </label>

    {children}

    {hint && (
      <p className="gum-hint mt-1.5 text-[11px] leading-5">
        {hint}
      </p>
    )}
  </div>
);

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
  const optionsQuery = useUserOptionsQuery(open);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const isEditing = Boolean(user?.id);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  const options = optionsQuery.data?.data || {};

  const branches = options.branches || [];

  const roles = options.roles?.length
    ? options.roles
    : [
        {
          value: "OWNER",
          label: "User / Owner",
        },
        {
          value: "SUPER_ADMIN",
          label: "Super Admin",
        },
      ];

  const selectedBranch = useMemo(
    () =>
      branches.find(
        (branch) =>
          Number(branch.id) === Number(form.branchId)
      ) || null,
    [branches, form.branchId]
  );

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    setError("");

    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "OWNER",
        department: user.department || "",
        location: user.location || "",
        branchId: user.branchId
          ? String(user.branchId)
          : "",
      });

      return;
    }

    setForm({ ...EMPTY_FORM });
  }, [open, user]);

  /*
  |--------------------------------------------------------------------------
  | Static Backdrop / Scroll Lock
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Update Field
  |--------------------------------------------------------------------------
  */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Role Change
  |--------------------------------------------------------------------------
  */

  const handleRoleChange = (role) => {
    setForm((previous) => ({
      ...previous,
      role,
      branchId:
        role === "SUPER_ADMIN"
          ? ""
          : previous.branchId,
    }));

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    if (isSaving) return;

    setError("");
    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Validate
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName) {
      return "Full name is required.";
    }

    if (fullName.length < 2) {
      return "Full name must contain at least 2 characters.";
    }

    if (fullName.length > 150) {
      return "Full name must not exceed 150 characters.";
    }

    if (!email) {
      return "Email address is required.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Enter a valid email address.";
    }

    if (email.length > 190) {
      return "Email address must not exceed 190 characters.";
    }

    if (!["OWNER", "SUPER_ADMIN"].includes(form.role)) {
      return "Select a valid user role.";
    }

    if (form.role === "OWNER" && !form.branchId) {
      return "Select a primary branch for this Owner.";
    }

    if (
      form.role === "OWNER" &&
      !branches.some(
        (branch) =>
          Number(branch.id) === Number(form.branchId)
      )
    ) {
      return "Select a valid primary branch.";
    }

    if (form.department.trim().length > 120) {
      return "Department must not exceed 120 characters.";
    }

    if (form.location.trim().length > 120) {
      return "Location must not exceed 120 characters.";
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    if (isSaving) return;

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const data = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      branchId:
        form.role === "OWNER"
          ? Number(form.branchId)
          : null,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          userId: Number(user.id),
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      onClose?.();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to save user. Please try again."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  if (!open) return null;

  const inputClass =
    "gum-input w-full rounded-xl px-4 py-3 text-sm";

  return createPortal(
    <div className="gum-overlay">
      <section
        className="gum-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        {/* HEADER */}

        <header className="gum-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="gum-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Users size={23} />
            </span>

            <div className="min-w-0">
              <p className="gum-eyebrow mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">
                <Sparkles size={12} />
                USER ACCESS MANAGEMENT
              </p>

              <h2
                id="user-modal-title"
                className="gum-title text-xl font-extrabold"
              >
                {isEditing ? "Edit User" : "Add User"}
              </h2>

              <p className="gum-muted mt-1 text-xs leading-5">
                Manage account access, lead ownership,
                and primary branch assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gum-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* BODY */}

        <div className="gum-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div
              role="alert"
              className="gum-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          {optionsQuery.isError && (
            <div
              role="alert"
              className="gum-error flex flex-wrap items-center gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle size={18} />

              <span>
                {optionsQuery.error?.response?.data?.message ||
                  "Unable to load user options."}
              </span>

              <button
                type="button"
                className="gum-retry ml-auto text-xs font-bold underline"
                onClick={() => optionsQuery.refetch()}
              >
                Retry
              </button>
            </div>
          )}

          {/* USER INFORMATION */}

          <div className="gum-section rounded-2xl p-5">
            <div className="gum-section-heading mb-5 flex items-center gap-3">
              <span className="gum-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <UserRound size={19} />
              </span>

              <div>
                <h3 className="gum-title text-sm font-extrabold">
                  User Information
                </h3>

                <p className="gum-muted mt-1 text-xs">
                  Personal details and account identity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  className={inputClass}
                  value={form.fullName}
                  maxLength={150}
                  autoComplete="name"
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Enter full name"
                />
              </FormField>

              <FormField label="Email Address" required>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  maxLength={190}
                  autoComplete="email"
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="name@company.com"
                />
              </FormField>

              <FormField label="Department">
                <input
                  type="text"
                  className={inputClass}
                  value={form.department}
                  maxLength={120}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField("department", event.target.value)
                  }
                  placeholder="e.g. Business Development"
                />
              </FormField>

              <FormField label="Location">
                <input
                  type="text"
                  className={inputClass}
                  value={form.location}
                  maxLength={120}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="e.g. Hyderabad"
                />
              </FormField>
            </div>
          </div>

          {/* ROLE & BRANCH */}

          <div className="gum-section rounded-2xl p-5">
            <div className="gum-section-heading mb-5 flex items-center gap-3">
              <span className="gum-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <ShieldCheck size={19} />
              </span>

              <div>
                <h3 className="gum-title text-sm font-extrabold">
                  Role & Branch Access
                </h3>

                <p className="gum-muted mt-1 text-xs">
                  Configure account permissions and branch visibility
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="User Role" required>
                <select
                  className={inputClass}
                  value={form.role}
                  disabled={isSaving || optionsQuery.isLoading}
                  onChange={(event) =>
                    handleRoleChange(event.target.value)
                  }
                >
                  {roles.map((role) => (
                    <option
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Primary Branch"
                required={form.role === "OWNER"}
              >
                <select
                  className={inputClass}
                  value={form.branchId}
                  disabled={
                    isSaving ||
                    optionsQuery.isLoading ||
                    form.role === "SUPER_ADMIN"
                  }
                  onChange={(event) =>
                    updateField("branchId", event.target.value)
                  }
                >
                  <option value="">
                    {form.role === "SUPER_ADMIN"
                      ? "Global access"
                      : optionsQuery.isLoading
                        ? "Loading branches..."
                        : "Select branch"}
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch.id}
                      value={String(branch.id)}
                    >
                      {branch.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {form.role === "OWNER" && selectedBranch && (
              <div className="gum-info mt-5 flex items-start gap-3 rounded-xl p-4">
                <Building2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-xs font-bold">
                    Primary Branch
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    {selectedBranch.name}
                    {selectedBranch.code
                      ? ` (${selectedBranch.code})`
                      : ""}
                  </p>
                </div>
              </div>
            )}

            {form.role === "SUPER_ADMIN" && (
              <div className="gum-info mt-5 flex items-start gap-3 rounded-xl p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-xs font-bold">
                    Global Access
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    Super Admin does not require a primary
                    branch and can manage records across
                    all branches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECURITY */}

          <div className="gum-section rounded-2xl p-5">
            <div className="gum-section-heading mb-5 flex items-center gap-3">
              <span className="gum-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <KeyRound size={19} />
              </span>

              <div>
                <h3 className="gum-title text-sm font-extrabold">
                  Security & Login Credentials
                </h3>

                <p className="gum-muted mt-1 text-xs">
                  Automatic password generation and email delivery
                </p>
              </div>
            </div>

            <div className="gum-info flex items-start gap-3 rounded-xl p-4">
              {isEditing ? (
                <>
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs font-bold">
                      Password Management
                    </p>

                    <p className="mt-1 text-xs leading-5">
                      User passwords cannot be changed
                      from this form. Users manage their
                      passwords through the secure
                      password-change process.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Mail
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs font-bold">
                      Temporary Password Sent Automatically
                    </p>

                    <p className="mt-1 text-xs leading-5">
                      When you create this user, Tempest Leads
                      will generate a secure temporary password
                      and send it to the email address entered
                      above using Resend.
                    </p>

                    <p className="mt-2 text-xs leading-5">
                      The user must change their temporary
                      password before accessing the CRM,
                      once the first-login password-change
                      feature is enabled on the backend.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <footer className="gum-footer flex shrink-0 items-center justify-between gap-3 px-6 py-4">
          <p className="gum-muted hidden text-xs sm:block">
            {isEditing
              ? "Changes are saved to your CRM."
              : "Login credentials will be emailed to the user."}
          </p>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="gum-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gum-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={submit}
              disabled={
                isSaving ||
                optionsQuery.isLoading ||
                optionsQuery.isError
              }
            >
              {isSaving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : isEditing ? (
                <Save size={17} />
              ) : (
                <Check size={17} />
              )}

              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default UserFormModal;