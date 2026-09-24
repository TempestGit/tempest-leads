/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Category Class
|--------------------------------------------------------------------------
*/

const categoryClass = (
  value
) =>
  String(
    value || ""
  )
    .toLowerCase()
    .replaceAll(
      " / ",
      "-"
    )
    .replaceAll(
      " ",
      "-"
    );

/*
|--------------------------------------------------------------------------
| Nurture Table
|--------------------------------------------------------------------------
*/

const NurtureTable = ({
  nurture = [],
  loading = false,
  onOpenLead,
}) => {
  if (loading) {
    return (
      <div className="empty-state">
        <p>
          Loading nurture
          records...
        </p>
      </div>
    );
  }

  if (
    !nurture.length
  ) {
    return (
      <div className="empty-state">
        <h2>
          No nurture records
        </h2>

        <p>
          Lost, later and
          no-response leads will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="tl-table nurture-table">
        <thead>
          <tr>
            <th>
              Company
            </th>

            <th>
              Contact
            </th>

            <th>
              Category
            </th>

            <th>
              Reason
            </th>

            <th>
              Industry
            </th>

            <th>
              Owner
            </th>

            <th>
              Last touch
            </th>

            <th>
              Reconnect
            </th>
          </tr>
        </thead>

        <tbody>
          {nurture.map(
            (
              item
            ) => (
              <tr
                key={
                  item.leadId
                }
                className="nurture-row"
                onClick={() =>
                  onOpenLead?.(
                    item.leadId
                  )
                }
              >
                {/* Company */}

                <td>
                  <button
                    type="button"
                    className="nurture-company-link"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      onOpenLead?.(
                        item.leadId
                      );
                    }}
                  >
                    <b>
                      {
                        item.companyName
                      }
                    </b>

                    <small>
                      {
                        item.leadCode
                      }
                    </small>
                  </button>
                </td>

                {/* Contact */}

                <td>
                  <div className="nurture-contact">
                    <span>
                      {item.contactName ||
                        "—"}
                    </span>

                    {item.designation && (
                      <small>
                        {
                          item.designation
                        }
                      </small>
                    )}
                  </div>
                </td>

                {/* Category */}

                <td>
                  <span
                    className={`nurture-category ${categoryClass(
                      item.categoryLabel
                    )}`}
                  >
                    {
                      item.categoryLabel
                    }
                  </span>
                </td>

                {/* Reason */}

                <td>
                  {item.reason ||
                    "—"}
                </td>

                {/* Industry */}

                <td>
                  {item.industry ||
                    "—"}
                </td>

                {/* Owner */}

                <td>
                  {item.ownerName ||
                    "—"}
                </td>

                {/* Last Touch */}

                <td>
                  {formatDate(
                    item.lastTouchAt
                  )}
                </td>

                {/* Reconnect */}

                <td>
                  {formatDate(
                    item.reconnectAt
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NurtureTable;