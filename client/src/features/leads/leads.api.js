import {
  apiRequest,
} from "../../lib/apiClient.js";

import {
  getSession,
} from "../auth/auth.api.js";

/*
|--------------------------------------------------------------------------
| Fetch Leads
|--------------------------------------------------------------------------
*/

export async function fetchLeads({
  search = "",
  page = 1,
  limit = 10,
  companyId = null,
  ownerId = null,
  priority = "",
  status = "",
  stage = "",
  signal,
} = {}) {
  const params =
    new URLSearchParams();

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  params.set(
    "page",
    String(page),
  );

  params.set(
    "limit",
    String(limit),
  );

  if (companyId) {
    params.set(
      "company_id",
      String(companyId),
    );
  }

  if (ownerId) {
    params.set(
      "owner_id",
      String(ownerId),
    );
  }

  if (priority) {
    params.set(
      "priority",
      priority,
    );
  }

  if (status) {
    params.set(
      "status",
      status,
    );
  }

  if (stage) {
    params.set(
      "stage",
      stage,
    );
  }

  const query =
    params.toString();

  return apiRequest(
    `/leads${
      query
        ? `?${query}`
        : ""
    }`,
    {
      signal,
    },
  );
}

/*
|--------------------------------------------------------------------------
| Fetch Lead
|--------------------------------------------------------------------------
*/

export async function fetchLead(
  id,
  {
    signal,
  } = {},
) {
  const result =
    await apiRequest(
      `/leads/${id}`,
      {
        signal,
      },
    );

  return result.data;
}

/*
|--------------------------------------------------------------------------
| Fetch Assignable Owners
|--------------------------------------------------------------------------
*/

export async function fetchAssignableOwners({
  signal,
} = {}) {
  const result =
    await apiRequest(
      "/leads/owners",
      {
        signal,
      },
    );

  return result.data;
}

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| requestKey must remain the SAME if the exact same submission is retried.
|
*/

export async function createLead(
  values,
  {
    requestKey,
  } = {},
) {
  if (!requestKey) {
    throw new Error(
      "Lead request key is required.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Refresh Session / CSRF Token
  |--------------------------------------------------------------------------
  */

  await getSession();

  /*
  |--------------------------------------------------------------------------
  | Create Lead
  |--------------------------------------------------------------------------
  */

  const result =
    await apiRequest(
      "/leads",
      {
        method:
          "POST",

        body:
          values,

        headers: {
          "Idempotency-Key":
            requestKey,
        },
      },
    );

  return result.data;
}