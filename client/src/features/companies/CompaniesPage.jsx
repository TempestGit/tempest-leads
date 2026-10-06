import {
  useMemo,
  useState,
} from "react";

import CompanyFormModal from "./CompanyFormModal.jsx";

import {
  useCompaniesQuery,
} from "./companies.queries.js";

/*
|--------------------------------------------------------------------------
| Stage CSS Class
|--------------------------------------------------------------------------
*/

const getStageClass = (
  stage
) => {
  if (!stage) {
    return "status";
  }

  return `status ${String(
    stage
  )
    .replaceAll(
      " ",
      "-"
    )
    .replaceAll(
      "/",
      "-"
    )}`;
};

/*
|--------------------------------------------------------------------------
| CSV Value
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
| Companies Page
|--------------------------------------------------------------------------
*/

const CompaniesPage =
  () => {
    const [
      companyModalOpen,
      setCompanyModalOpen,
    ] = useState(
      false
    );

    /*
    |--------------------------------------------------------------------------
    | Query
    |--------------------------------------------------------------------------
    */

    const params =
      useMemo(
        () => ({
          page: 1,

          limit: 100,

          sort:
            "createdAt",

          direction:
            "asc",
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
      useCompaniesQuery(
        params
      );

    const companies =
      data?.data
        ?.companies ||
      [];

    /*
    |--------------------------------------------------------------------------
    | Export Companies
    |--------------------------------------------------------------------------
    */

    const handleExport =
      () => {
        if (
          companies.length ===
          0
        ) {
          return;
        }

        const headers = [
          "Company ID",
          "Company / brand",
          "Industry",
          "City",
          "Website",
          "Existing agency",
          "Source",
          "Stage",
          "Contacts",
        ];

        const rows =
          companies.map(
            (
              company
            ) => [
              company.companyCode,
              company.name,
              company.industry,
              company.city,
              company.website,
              company.agencyRelationship,
              company.source,
              company.currentStage ||
                "—",
              company.contactsCount,
            ]
          );

        const csv = [
          headers
            .map(
              csvValue
            )
            .join(
              ","
            ),

          ...rows.map(
            (
              row
            ) =>
              row
                .map(
                  csvValue
                )
                .join(
                  ","
                )
          ),
        ].join(
          "\n"
        );

        const blob =
          new Blob(
            [
              csv,
            ],
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
          "tempest-companies.csv";

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
        {/* Page Title */}
        {/* --------------------------------------------------------------- */}

        <div className="tl-title-row">
          <div>
            <h1>
              Company Master
            </h1>

            <p>
              One company record
              supports multiple
              contacts, leads and
              interactions.
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
                companies.length ===
                0
              }
            >
              Export
            </button>

            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                setCompanyModalOpen(
                  true
                )
              }
            >
              + Add company
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Companies Table */}
        {/* --------------------------------------------------------------- */}

        <article className="tl-card no-pad">
          {isLoading ? (
            <div className="empty-state">
              <h2>
                Loading companies
              </h2>

              <p>
                Loading company
                records...
              </p>
            </div>
          ) : isError ? (
            <div className="empty-state">
              <h2>
                Unable to load
                companies
              </h2>

              <p>
                {error
                  ?.response
                  ?.data
                  ?.message ||
                  "Something went wrong while loading companies."}
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
                      Company ID
                    </th>

                    <th>
                      Company /
                      brand
                    </th>

                    <th>
                      Industry
                    </th>

                    <th>
                      City
                    </th>

                    <th>
                      Website
                    </th>

                    <th>
                      Existing
                      agency
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Contacts
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {companies.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={
                          9
                        }
                      >
                        <div className="empty-state">
                          <h2>
                            No companies
                            found
                          </h2>

                          <p>
                            Create your
                            first company
                            record.
                          </p>

                          <button
                            type="button"
                            className="tl-primary"
                            onClick={() =>
                              setCompanyModalOpen(
                                true
                              )
                            }
                          >
                            + Add company
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    companies.map(
                      (
                        company
                      ) => (
                        <tr
                          key={
                            company.id
                          }
                        >
                          {/* Company ID */}

                          <td>
                            {
                              company.companyCode
                            }
                          </td>

                          {/* Company */}

                          <td>
                            <b>
                              {
                                company.name
                              }
                            </b>
                          </td>

                          {/* Industry */}

                          <td>
                            {company.industry ||
                              "—"}
                          </td>

                          {/* City */}

                          <td>
                            {company.city ||
                              "—"}
                          </td>

                          {/* Website */}

                          <td>
                            {company.website ? (
                              <a
                                href={
                                  company.website.startsWith(
                                    "http://"
                                  ) ||
                                  company.website.startsWith(
                                    "https://"
                                  )
                                    ? company.website
                                    : `https://${company.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                {company.website
                                  .replace(
                                    /^https?:\/\//,
                                    ""
                                  )
                                  .replace(
                                    /\/$/,
                                    ""
                                  )}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Existing Agency */}

                          <td>
                            {company.agencyRelationship ||
                              "—"}
                          </td>

                          {/* Source */}

                          <td>
                            {company.source ||
                              "—"}
                          </td>

                          {/* Stage */}

                          <td>
                            {company.currentStage ? (
                              <span
                                className={
                                  getStageClass(
                                    company.currentStage
                                  )
                                }
                              >
                                {
                                  company.currentStage
                                }
                              </span>
                            ) : (
                              <span className="status">
                                No lead
                              </span>
                            )}
                          </td>

                          {/* Contacts */}

                          <td>
                            {Number(
                              company.contactsCount ||
                                0
                            )}
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

        {/* --------------------------------------------------------------- */}
        {/* Small Loading State When Refreshing */}
        {/* --------------------------------------------------------------- */}

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
        {/* Add Company Modal */}
        {/* --------------------------------------------------------------- */}

        <CompanyFormModal
          open={
            companyModalOpen
          }
          onClose={() =>
            setCompanyModalOpen(
              false
            )
          }
        />
      </>
    );
  };

export default CompaniesPage;