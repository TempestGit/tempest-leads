
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  Clock3,
  HeartHandshake,
  UserRound,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const categoryClass = (value) => {
  const label = String(value || "").toLowerCase();

  if (label.includes("lost")) return "lost";
  if (label.includes("response")) return "no-response";
  if (label.includes("later")) return "later";

  return "default";
};

const getReconnectState = (value) => {
  if (!value) return "none";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "none";

  return date.getTime() < Date.now() ? "overdue" : "upcoming";
};

const NurtureTable = ({
  nurture = [],
  loading = false,
  onOpenLead,
}) => {
  if (loading) {
    return (
      <div className="gn-table-loading space-y-3 p-6">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="gn-skeleton h-16 rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (!nurture.length) {
    return (
      <div className="gn-empty flex flex-col items-center px-6 py-16 text-center">
        <span className="gn-empty-icon mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
          <HeartHandshake size={30} />
        </span>

        <h3 className="gn-heading text-lg font-extrabold">
          No nurture records
        </h3>

        <p className="gn-muted mt-2 max-w-md text-sm leading-6">
          Lost, later and no-response leads will appear here.
          If you applied a search or category filter, try clearing it.
        </p>
      </div>
    );
  }

  return (
    <div className="gn-table-scroll w-full overflow-x-auto">
      <table className="gn-table w-full">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Category</th>
            <th>Reason</th>
            <th>Industry</th>
            <th>Owner</th>
            <th>Last Touch</th>
            <th>Reconnect</th>
            <th aria-label="Open" />
          </tr>
        </thead>

        <tbody>
          {nurture.map((item) => {
            const reconnectState = getReconnectState(item.reconnectAt);

            return (
              <tr
                key={item.leadId}
                className="gn-table-row cursor-pointer"
                onClick={() => onOpenLead?.(item.leadId)}
              >
                <td>
                  <button
                    type="button"
                    className="gn-company flex items-center gap-3 text-left"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenLead?.(item.leadId);
                    }}
                  >
                    <span className="gn-company-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Building2 size={18} />
                    </span>

                    <span className="min-w-0">
                      <span className="gn-heading block max-w-44 truncate text-sm font-bold">
                        {item.companyName || "Unnamed Company"}
                      </span>

                      <span className="gn-muted mt-1 block text-xs">
                        {item.leadCode || `Lead #${item.leadId}`}
                      </span>
                    </span>
                  </button>
                </td>

                <td>
                  <div className="flex items-start gap-2">
                    <UserRound
                      size={15}
                      className="gn-cell-icon mt-0.5 shrink-0"
                    />

                    <div>
                      <span className="gn-cell-main block text-sm">
                        {item.contactName || "—"}
                      </span>

                      {item.designation && (
                        <span className="gn-muted mt-1 block text-xs">
                          {item.designation}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    className={`gn-category gn-category-${categoryClass(
                      item.categoryLabel
                    )} inline-flex rounded-full px-3 py-1.5 text-xs font-bold`}
                  >
                    {item.categoryLabel || "Uncategorized"}
                  </span>
                </td>

                <td className="gn-cell-main max-w-48 text-sm">
                  {item.reason || "—"}
                </td>

                <td className="gn-cell-main text-sm">
                  {item.industry || "—"}
                </td>

                <td>
                  <span className="gn-owner inline-flex items-center gap-2 text-sm">
                    <span className="gn-owner-avatar flex h-8 w-8 items-center justify-center rounded-full">
                      <UserRound size={15} />
                    </span>

                    {item.ownerName || "—"}
                  </span>
                </td>

                <td>
                  <span className="gn-date inline-flex items-center gap-2 text-xs">
                    <Clock3 size={14} />
                    {formatDate(item.lastTouchAt)}
                  </span>
                </td>

                <td>
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="gn-date inline-flex items-center gap-2 text-xs">
                      <CalendarClock size={14} />
                      {formatDate(item.reconnectAt)}
                    </span>

                    {reconnectState !== "none" && (
                      <span
                        className={`gn-reconnect-state gn-reconnect-${reconnectState} rounded-full px-2 py-0.5 text-[10px] font-bold`}
                      >
                        {reconnectState === "overdue"
                          ? "Overdue"
                          : "Upcoming"}
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <button
                    type="button"
                    className="gn-open flex h-9 w-9 items-center justify-center rounded-lg"
                    aria-label={`Open ${item.companyName || "lead"}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenLead?.(item.leadId);
                    }}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NurtureTable;