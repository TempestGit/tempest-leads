import {
  findLead,
  insertLead,
  listAssignableOwners as listAssignableOwnerRecords,
  listLeads as listLeadRecords,
} from "./leads.repository.js";

import {
  createLeadPayloadHash,
  isValidLeadCreationRequestKey,
} from "./leadCreationIdempotency.js";

/*
|--------------------------------------------------------------------------
| Service Error
|--------------------------------------------------------------------------
*/

function serviceError(code, message) {
  const error = new Error(message);

  error.code = code;

  return error;
}

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export async function listLeads(
  user,
  filters = {},
) {
  return listLeadRecords(
    user,
    filters,
  );
}

/*
|--------------------------------------------------------------------------
| Get Lead
|--------------------------------------------------------------------------
*/

export async function getLead(
  user,
  id,
) {
  return findLead(
    user,
    id,
  );
}

/*
|--------------------------------------------------------------------------
| Assignable Owners
|--------------------------------------------------------------------------
*/

export async function getAssignableOwners(
  user,
) {
  return listAssignableOwnerRecords(
    user,
  );
}

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export async function createLead(
  user,
  input,
  {
    requestKey,
  } = {},
) {
  /*
  |--------------------------------------------------------------------------
  | Idempotency Key Required
  |--------------------------------------------------------------------------
  */

  if (!requestKey) {
    throw serviceError(
      "LEAD_IDEMPOTENCY_KEY_REQUIRED",
      "Idempotency-Key header is required.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Idempotency Key
  |--------------------------------------------------------------------------
  */

  if (
    !isValidLeadCreationRequestKey(
      requestKey,
    )
  ) {
    throw serviceError(
      "LEAD_IDEMPOTENCY_KEY_INVALID",
      "Idempotency-Key must be a valid UUID.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create Payload Hash
  |--------------------------------------------------------------------------
  */

  const payloadHash =
    createLeadPayloadHash(
      input,
    );

  /*
  |--------------------------------------------------------------------------
  | Create Lead
  |--------------------------------------------------------------------------
  */

  return insertLead(
    user,
    input,
    {
      requestKey,
      payloadHash,
    },
  );
}