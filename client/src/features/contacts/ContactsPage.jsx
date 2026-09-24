import {
  useMemo,
  useState,
} from "react";

import {
  useContactsQuery,
} from "./contacts.queries.js";

import ContactFormModal from "./ContactFormModal.jsx";

/*
|--------------------------------------------------------------------------
| CSV Helper
|--------------------------------------------------------------------------
*/

const csvValue = (
  value
) => {
  const text =
    String(
      value ?? ""
    );

  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
};

/*
|--------------------------------------------------------------------------
| Contacts Page
|--------------------------------------------------------------------------
*/

const ContactsPage = () => {
  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Prototype does not show filters/pagination controls.
  |--------------------------------------------------------------------------
  */

  const params =
    useMemo(
      () => ({
        page: 1,

        limit: 100,

        sort: "createdAt",

        direction: "asc",
      }),
      []
    );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useContactsQuery(
      params
    );

  const contacts =
    data?.data
      ?.contacts || [];

  /*
  |--------------------------------------------------------------------------
  | Export
  |--------------------------------------------------------------------------
  */

  const handleExport =
    () => {
      if (
        contacts.length ===
        0
      ) {
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

      const rows =
        contacts.map(
          (contact) => [
            contact.contactCode,
            contact.name,
            contact.companyName,
            contact.designation,
            contact.phone,
            contact.email,

            contact.isDecisionMaker
              ? "Yes"
              : "No",
          ]
        );

      const csv = [
        headers
          .map(csvValue)
          .join(","),

        ...rows.map(
          (row) =>
            row
              .map(
                csvValue
              )
              .join(",")
        ),
      ].join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        url;

      anchor.download =
        "tempest-contacts.csv";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url
      );
    };

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Title */}
      {/* --------------------------------------------------------------- */}

      <div className="tl-title-row">
        <div>
          <h1>
            Contact Master
          </h1>

          <p>
            Contacts are
            independent records.
            A company can have
            many decision-makers
            and stakeholders.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              handleExport
            }
            disabled={
              contacts.length ===
              0
            }
          >
            Export
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setModalOpen(
                true
              )
            }
          >
            + Add contact
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Table */}
      {/* --------------------------------------------------------------- */}

      <article className="tl-card no-pad">
        {isLoading ? (
          <div className="empty-state">
            <h2>
              Loading contacts
            </h2>

            <p>
              Loading contact
              records...
            </p>
          </div>
        ) : isError ? (
          <div className="empty-state">
            <h2>
              Unable to load
              contacts
            </h2>

            <p>
              {error
                ?.response
                ?.data
                ?.message ||
                "Something went wrong while loading contacts."}
            </p>

            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                refetch()
              }
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>
                    Contact ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Decision maker
                  </th>
                </tr>
              </thead>

              <tbody>
                {contacts.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                    >
                      <div className="empty-state">
                        <h2>
                          No contacts
                          found
                        </h2>

                        <p>
                          Add the first
                          contact for a
                          company.
                        </p>

                        <button
                          type="button"
                          className="tl-primary"
                          onClick={() =>
                            setModalOpen(
                              true
                            )
                          }
                        >
                          + Add contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map(
                    (
                      contact
                    ) => (
                      <tr
                        key={
                          contact.id
                        }
                      >
                        {/* Contact ID */}

                        <td>
                          {
                            contact.contactCode
                          }
                        </td>

                        {/* Name */}

                        <td>
                          <b>
                            {
                              contact.name
                            }
                          </b>
                        </td>

                        {/* Company */}

                        <td>
                          {
                            contact.companyName
                          }
                        </td>

                        {/* Designation */}

                        <td>
                          {contact.designation ||
                            "—"}
                        </td>

                        {/* Phone */}

                        <td>
                          {contact.phone ||
                            "—"}
                        </td>

                        {/* Email */}

                        <td>
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                            >
                              {
                                contact.email
                              }
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
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {isFetching &&
        !isLoading && (
          <div
            style={{
              marginTop:
                "8px",

              color:
                "var(--muted)",

              fontSize:
                "10px",
            }}
          >
            Refreshing...
          </div>
        )}

      {/* --------------------------------------------------------------- */}
      {/* Add Contact */}
      {/* --------------------------------------------------------------- */}

      <ContactFormModal
        open={
          modalOpen
        }
        onClose={() =>
          setModalOpen(
            false
          )
        }
      />
    </>
  );
};

export default ContactsPage;