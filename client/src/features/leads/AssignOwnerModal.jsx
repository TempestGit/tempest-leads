
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useChangeLeadOwnerMutation,
  useLeadOwnersQuery,
} from "./leads.queries.js";

import "./assign-owner-glass.css";

/*
|--------------------------------------------------------------------------
| Assign Owner Modal
|--------------------------------------------------------------------------
|
| Rules:
| - The lead's Primary Branch cannot be changed here.
| - Owner options come from the lead's Primary Branch.
| - SUPER_ADMIN is global and may appear for every branch.
| - Normal owners must belong to the same branch as the lead.
|
*/

const AssignOwnerModal = ({
  open,
  leadIds = [],
  lead = null,
  branchId = null,
  onClose,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Effective Lead Branch
  |--------------------------------------------------------------------------
  */

  const effectiveBranchId = lead?.branchId || branchId || null;

  /*
  |--------------------------------------------------------------------------
  | Owner Options
  |--------------------------------------------------------------------------
  */

  const ownersQuery = useLeadOwnersQuery(
    effectiveBranchId,
    open && Boolean(effectiveBranchId)
  );

  /*
  |--------------------------------------------------------------------------
  | Mutation
  |--------------------------------------------------------------------------
  */

  const mutation = useChangeLeadOwnerMutation();

  /*
  |--------------------------------------------------------------------------
  | API Data
  |--------------------------------------------------------------------------
  */

  const owners = ownersQuery.data?.data?.owners || [];

  const selectedBranch =
    ownersQuery.data?.data?.selectedBranch || null;

  /*
  |--------------------------------------------------------------------------
  | Resolved Branch
  |--------------------------------------------------------------------------
  */

  const branch = useMemo(() => {
    if (selectedBranch) return selectedBranch;

    if (!lead) return null;

    return {
      id: lead.branchId,
      name: lead.branchName,
      code: lead.branchCode,
    };
  }, [lead, selectedBranch]);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [ownerId, setOwnerId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    setOwnerId("");
    setReason("");
    setError("");
  }, [open, effectiveBranchId]);

  /*
  |--------------------------------------------------------------------------
  | Lock Background Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Existing Owner
  |--------------------------------------------------------------------------
  */

  const currentOwnerId = lead?.ownerId
    ? Number(lead.ownerId)
    : null;

  /*
  |--------------------------------------------------------------------------
  | Selected Owner
  |--------------------------------------------------------------------------
  */

  const selectedOwner = useMemo(
    () =>
      owners.find(
        (owner) => Number(owner.id) === Number(ownerId)
      ) || null,
    [owners, ownerId]
  );

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    if (mutation.isPending) return;

    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    if (mutation.isPending) return;

    setError("");

    if (!leadIds.length) {
      setError("Select one or more leads first.");
      return;
    }

    if (!effectiveBranchId) {
      setError(
        "This lead does not have a Primary Branch. Assign a branch before changing the owner."
      );
      return;
    }

    if (!ownerId) {
      setError("Select an owner.");
      return;
    }

    if (
      leadIds.length === 1 &&
      currentOwnerId &&
      Number(ownerId) === currentOwnerId
    ) {
      setError("This user already owns the lead.");
      return;
    }

    try {
      for (const itemLeadId of leadIds) {
        await mutation.mutateAsync({
          leadId: Number(itemLeadId),
          data: {
            ownerId: Number(ownerId),
            reason: reason.trim() || null,
          },
        });
      }

      onClose?.();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to assign owner."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Closed
  |--------------------------------------------------------------------------
  */

  if (!open) return null;

  const isBulk = leadIds.length > 1;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return createPortal(
    <div className="gaom-overlay">
      <section
        className="gaom-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-owner-title"
      >
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="gaom-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="gaom-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <ArrowRightLeft size={23} />
            </span>

            <div className="min-w-0">
              <p className="gaom-eyebrow mb-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                LEAD OWNERSHIP
              </p>

              <h2
                id="assign-owner-title"
                className="gaom-title text-xl font-extrabold"
              >
                {isBulk ? "Assign Owner" : "Change Owner"}
              </h2>

              <p className="gaom-muted mt-1 text-xs leading-5">
                {isBulk
                  ? `Assign ${leadIds.length} selected leads to an owner.`
                  : "Reassign this lead to another active owner."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gaom-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={mutation.isPending}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* ========================================================= */}
        {/* BODY */}
        {/* ========================================================= */}

        <div className="gaom-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Selection Summary */}

          <div className="gaom-summary grid grid-cols-2 gap-3 rounded-2xl p-4">
            <div className="gaom-summary-card flex items-center gap-3 rounded-xl p-3">
              <span className="gaom-summary-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Users size={19} />
              </span>

              <div>
                <p className="gaom-muted text-[11px] font-semibold">
                  Selected Leads
                </p>

                <p className="gaom-title mt-1 text-lg font-extrabold">
                  {leadIds.length}
                </p>
              </div>
            </div>

            <div className="gaom-summary-card flex items-center gap-3 rounded-xl p-3">
              <span className="gaom-summary-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Building2 size={19} />
              </span>

              <div className="min-w-0">
                <p className="gaom-muted text-[11px] font-semibold">
                  Primary Branch
                </p>

                <p className="gaom-title mt-1 truncate text-sm font-extrabold">
                  {branch?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* General Error */}

          {error && (
            <div
              role="alert"
              className="gaom-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Missing Branch */}

          {!effectiveBranchId && (
            <div
              role="alert"
              className="gaom-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                This lead does not have a Primary Branch.
                Assign a branch before changing its owner.
              </span>
            </div>
          )}

          {/* Owners Query Error */}

          {effectiveBranchId && ownersQuery.isError && (
            <div
              role="alert"
              className="gaom-error flex flex-wrap items-center gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle size={18} />

              <span className="flex-1">
                {ownersQuery.error?.response?.data?.message ||
                  "Unable to load owners for this branch."}
              </span>

              <button
                type="button"
                className="gaom-retry inline-flex items-center gap-1.5 text-xs font-bold"
                onClick={() => ownersQuery.refetch()}
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          )}

          {/* No Owners */}

          {effectiveBranchId &&
            !ownersQuery.isLoading &&
            !ownersQuery.isError &&
            owners.length === 0 && (
              <div
                role="alert"
                className="gaom-error flex items-start gap-3 rounded-xl p-4 text-sm"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  No active owners are available for this
                  branch. Check the Users / Owners module
                  and make sure the required users are active.
                </span>
              </div>
            )}

          {/* ======================================================= */}
          {/* OWNERSHIP FORM */}
          {/* ======================================================= */}

          <div className="gaom-section rounded-2xl p-5">
            <div className="gaom-section-heading mb-5 flex items-center gap-3">
              <span className="gaom-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <UserRound size={19} />
              </span>

              <div>
                <h3 className="gaom-title text-sm font-extrabold">
                  Ownership Details
                </h3>

                <p className="gaom-muted mt-1 text-xs">
                  Choose an eligible owner for the lead
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Primary Branch */}

              <div>
                <label className="gaom-label mb-2 block text-xs font-bold">
                  Primary Branch
                </label>

                <div className="relative">
                  <Building2
                    size={17}
                    className="gaom-input-icon absolute left-4 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    className="gaom-input gaom-readonly gaom-input-with-icon w-full rounded-xl py-3 text-sm"
                    value={branch?.name || lead?.branchName || ""}
                    readOnly
                    placeholder="No branch assigned"
                  />
                </div>
              </div>

              {/* Current Owner */}

              {lead && (
                <div>
                  <label className="gaom-label mb-2 block text-xs font-bold">
                    Current Owner
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="gaom-input-icon absolute left-4 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      className="gaom-input gaom-readonly gaom-input-with-icon w-full rounded-xl py-3 text-sm"
                      value={lead.ownerName || "—"}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* New Owner */}

              <div className="sm:col-span-2">
                <label className="gaom-label mb-2 block text-xs font-bold">
                  New Owner
                  <span className="gaom-required ml-1">*</span>
                </label>

                <select
                  className="gaom-input w-full rounded-xl px-4 py-3 text-sm"
                  value={ownerId}
                  disabled={
                    !effectiveBranchId ||
                    ownersQuery.isLoading ||
                    ownersQuery.isError ||
                    mutation.isPending ||
                    owners.length === 0
                  }
                  onChange={(event) => {
                    setOwnerId(event.target.value);
                    setError("");
                  }}
                >
                  <option value="">
                    {!effectiveBranchId
                      ? "Primary branch required"
                      : ownersQuery.isLoading
                        ? "Loading owners..."
                        : owners.length === 0
                          ? "No owners available"
                          : "Select owner"}
                  </option>

                  {owners.map((owner) => {
                    const isCurrent =
                      currentOwnerId &&
                      Number(owner.id) === currentOwnerId;

                    return (
                      <option
                        key={owner.id}
                        value={owner.id}
                        disabled={Boolean(isCurrent)}
                      >
                        {owner.fullName ||
                          owner.name ||
                          `User ${owner.id}`}

                        {owner.role === "SUPER_ADMIN"
                          ? " · Global"
                          : owner.branchName
                            ? ` · ${owner.branchName}`
                            : ""}

                        {isCurrent ? " · Current" : ""}
                      </option>
                    );
                  })}
                </select>

                {branch?.name && (
                  <p className="gaom-muted mt-2 text-xs leading-5">
                    Only active {branch.name} owners and
                    global Super Admin users are available.
                  </p>
                )}
              </div>

              {/* Reason */}

              <div className="sm:col-span-2">
                <label className="gaom-label mb-2 block text-xs font-bold">
                  Reason
                  <span className="gaom-optional ml-2 text-[11px] font-medium">
                    Optional
                  </span>
                </label>

                <textarea
                  rows={3}
                  className="gaom-input w-full resize-y rounded-xl px-4 py-3 text-sm"
                  value={reason}
                  disabled={mutation.isPending}
                  placeholder="Reason for assignment / reassignment"
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selected Owner Preview */}

          {selectedOwner && (
            <div className="gaom-selected flex items-start gap-3 rounded-2xl p-4">
              <span className="gaom-selected-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <CheckCircle2 size={21} />
              </span>

              <div>
                <p className="text-xs font-extrabold">
                  New Owner Selected
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedOwner.fullName ||
                    selectedOwner.name ||
                    `User ${selectedOwner.id}`}
                </p>

                <p className="mt-1 text-xs">
                  {selectedOwner.role === "SUPER_ADMIN"
                    ? "Global Super Admin"
                    : selectedOwner.branchName ||
                      branch?.name ||
                      "Branch Owner"}
                </p>
              </div>
            </div>
          )}

          {/* Ownership Rule */}

          {branch?.name && (
            <div className="gaom-info flex items-start gap-3 rounded-2xl p-4">
              <span className="gaom-info-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <ShieldCheck size={18} />
              </span>

              <div>
                <p className="text-xs font-extrabold">
                  Ownership Rule
                </p>

                <p className="mt-1 text-xs leading-5">
                  This lead remains assigned to the{" "}
                  <strong>{branch.name}</strong> branch.
                  Changing the owner does not change the
                  lead's Primary Branch.
                </p>
              </div>
            </div>
          )}

          <p className="gaom-muted flex items-start gap-2 text-xs leading-5">
            <Info size={15} className="mt-0.5 shrink-0" />
            The ownership change will be recorded in the
            activity and audit history.
          </p>
        </div>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <footer className="gaom-footer flex shrink-0 items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            className="gaom-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>

          <button
            type="button"
            className="gaom-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
            disabled={
              mutation.isPending ||
              !effectiveBranchId ||
              ownersQuery.isLoading ||
              ownersQuery.isError ||
              owners.length === 0 ||
              !ownerId
            }
            onClick={submit}
          >
            {mutation.isPending ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <ArrowRightLeft size={17} />
            )}

            {mutation.isPending
              ? isBulk
                ? "Assigning..."
                : "Updating..."
              : isBulk
                ? "Assign Owner"
                : "Change Owner"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default AssignOwnerModal;