
import { useMemo, useState } from "react";

import { Pencil, Trash2, LoaderCircle, X } from "lucide-react";

import {
  useContactsQuery,
  useDeleteContactMutation,
} from "./contacts.queries.js";

import ContactFormModal from "./ContactFormModal.jsx";

/*
|--------------------------------------------------------------------------
| CSV Helper
|--------------------------------------------------------------------------
*/

const csvValue = (value) => {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
};

/*
|--------------------------------------------------------------------------
| Contacts Page
|--------------------------------------------------------------------------
*/

const ContactsPage = () => {
  /*
  |--------------------------------------------------------------------------
  | Modal State
  |--------------------------------------------------------------------------
  */

  const [modalOpen, setModalOpen] = useState(false);

  const [editingContact, setEditingContact] = useState(null);

  const [deletingContact, setDeletingContact] = useState(null);

  const [deleteError, setDeleteError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Query Params
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | Queries / Mutations
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useContactsQuery(params);

  const deleteMutation = useDeleteContactMutation();

  const contacts = data?.data?.contacts || [];

  /*
  |--------------------------------------------------------------------------
  | Add Contact
  |--------------------------------------------------------------------------
  */

  const handleAddContact = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Contact
  |--------------------------------------------------------------------------
  */

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Contact Modal
  |--------------------------------------------------------------------------
  */

  const handleCloseContactModal = () => {
    setModalOpen(false);
    setEditingContact(null);

    refetch();
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Contact
  |--------------------------------------------------------------------------
  */

  const handleOpenDelete = (contact) => {
    setDeleteError("");
    setDeletingContact(contact);
  };

  const handleCloseDelete = () => {
    if (deleteMutation.isPending) {
      return;
    }

    setDeletingContact(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact || deleteMutation.isPending) {
      return;
    }

    try {
      setDeleteError("");

      await deleteMutation.mutateAsync(
        deletingContact.id
      );

      setDeletingContact(null);

      await refetch();
    } catch (deleteRequestError) {
      setDeleteError(
        deleteRequestError?.response?.data?.message ||
          "Unable to delete contact. Please try again."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Export CSV
  |--------------------------------------------------------------------------
  */

  const handleExport = () => {
    if (contacts.length === 0) {
      return;
    }

    const headers = [
      "Contact ID",
      "Name",
      "Company",
      "Designation",
      "Phone",
      "Email",
      "Decision maker",
    ];

    const rows = contacts.map((contact) => [
      contact.contactCode,
      contact.name,
      contact.companyName,
      contact.designation,
      contact.phone,
      contact.email,
      contact.isDecisionMaker ? "Yes" : "No",
    ]);

    const csv = [
      headers.map(csvValue).join(","),
      ...rows.map((row) => row.map(csvValue).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "tempest-contacts.csv";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Title */}
      {/* --------------------------------------------------------------- */}

      <div className="tl-title-row">
        <div>
          <h1>Contact Master</h1>

          <p>
            Contacts are independent records. A company can
            have many decision-makers and stakeholders.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="tl-secondary"
            onClick={handleExport}
            disabled={contacts.length === 0}
          >
            Export
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={handleAddContact}
          >
            + Add contact
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Contacts Table */}
      {/* --------------------------------------------------------------- */}

      <article className="tl-card no-pad">
        {isLoading ? (
          <div className="empty-state">
            <h2>Loading contacts</h2>

            <p>Loading contact records...</p>
          </div>
        ) : isError ? (
          <div className="empty-state">
            <h2>Unable to load contacts</h2>

            <p>
              {error?.response?.data?.message ||
                "Something went wrong while loading contacts."}
            </p>

            <button
              type="button"
              className="tl-primary"
              onClick={() => refetch()}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Contact ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Decision maker</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <h2>No contacts found</h2>

                        <p>
                          Add the first contact for a company.
                        </p>

                        <button
                          type="button"
                          className="tl-primary"
                          onClick={handleAddContact}
                        >
                          + Add contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      {/* Contact ID */}

                      <td>
                        {contact.contactCode ||
                          `CON-${contact.id}`}
                      </td>

                      {/* Name */}

                      <td>
                        <b>{contact.name || "—"}</b>
                      </td>

                      {/* Company */}

                      <td>
                        {contact.companyName || "—"}
                      </td>

                      {/* Designation */}

                      <td>
                        {contact.designation || "—"}
                      </td>

                      {/* Phone */}

                      <td>
                        {contact.phone || "—"}
                      </td>

                      {/* Email */}

                      <td>
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                          >
                            {contact.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Decision Maker */}

                      <td>
                        {contact.isDecisionMaker
                          ? "Yes"
                          : "No"}
                      </td>

                      {/* Actions */}

                      <td>
                        <div
                          className="button-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "nowrap",
                          }}
                        >
                          <button
                            type="button"
                            className="tl-secondary"
                            onClick={() =>
                              handleEditContact(contact)
                            }
                            title="Edit contact"
                            aria-label={`Edit ${
                              contact.name || "contact"
                            }`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            className="tl-danger"
                            onClick={() =>
                              handleOpenDelete(contact)
                            }
                            title="Delete contact"
                            aria-label={`Delete ${
                              contact.name || "contact"
                            }`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* --------------------------------------------------------------- */}
      {/* Refresh Indicator */}
      {/* --------------------------------------------------------------- */}

      {isFetching && !isLoading && (
        <div
          style={{
            marginTop: "8px",
            color: "var(--muted)",
            fontSize: "10px",
          }}
        >
          Refreshing...
        </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Add / Edit Contact Modal */}
      {/* --------------------------------------------------------------- */}

      <ContactFormModal
        open={modalOpen}
        mode={editingContact ? "edit" : "create"}
        contact={editingContact}
        onClose={handleCloseContactModal}
      />

      {/* --------------------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* --------------------------------------------------------------- */}

      {deletingContact && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDelete();
            }
          }}
        >
          <section
            className="tl-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            aria-describedby="delete-contact-description"
            style={{
              maxWidth: "440px",
              width: "100%",
            }}
          >
            <header className="modal-head">
              <div>
                <h2 id="delete-contact-title">
                  Delete contact
                </h2>

                <p className="muted">
                  Please confirm this action.
                </p>
              </div>

              <button
                type="button"
                className="icon-control"
                onClick={handleCloseDelete}
                disabled={deleteMutation.isPending}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </header>

            <div className="modal-body">
              <p id="delete-contact-description">
                Are you sure you want to delete{" "}
                <b>
                  {deletingContact.name ||
                    deletingContact.contactCode ||
                    "this contact"}
                </b>
                ?
              </p>

              <p className="muted">
                This contact will be removed from active
                contact lists.
              </p>

              {deleteError && (
                <div
                  className="error-box"
                  role="alert"
                  style={{
                    marginTop: "12px",
                  }}
                >
                  {deleteError}
                </div>
              )}
            </div>

            <footer className="modal-foot">
              <button
                type="button"
                className="tl-secondary"
                onClick={handleCloseDelete}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="tl-danger"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete contact
                  </>
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
};

export default ContactsPage;
