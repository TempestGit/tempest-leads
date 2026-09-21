import crypto from "node:crypto";

/*
|--------------------------------------------------------------------------
| Idempotency Key Validation
|--------------------------------------------------------------------------
|
| The frontend generates one UUID per Create Lead submission.
|
| Example:
|
| Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
|
| Retries of the SAME submission must reuse the SAME key.
|
*/

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/*
|--------------------------------------------------------------------------
| Read Request Key
|--------------------------------------------------------------------------
*/

export function getLeadCreationRequestKey(req) {
  const value = req.get("Idempotency-Key");

  if (!value) {
    return null;
  }

  return String(value).trim();
}

/*
|--------------------------------------------------------------------------
| Validate Request Key
|--------------------------------------------------------------------------
*/

export function isValidLeadCreationRequestKey(requestKey) {
  if (!requestKey) {
    return false;
  }

  return UUID_REGEX.test(requestKey);
}

/*
|--------------------------------------------------------------------------
| Normalize Value
|--------------------------------------------------------------------------
|
| Object key order must not affect the hash.
|
| These two objects must produce the same hash:
|
| {
|   company_id: 10,
|   title: "Website Redesign"
| }
|
| {
|   title: "Website Redesign",
|   company_id: 10
| }
|
*/

function normalizeValue(value) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (typeof value === "object") {
    const normalized = {};

    Object.keys(value)
      .sort()
      .forEach((key) => {
        const item = value[key];

        /*
         * Ignore undefined properties because Zod/default processing
         * can result in optional properties not being present.
         */
        if (item !== undefined) {
          normalized[key] = normalizeValue(item);
        }
      });

    return normalized;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| Create Payload Hash
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Pass the VALIDATED lead data here, not req.body directly.
|
| We hash only the normalized business payload.
| The Idempotency-Key itself is NOT included in the payload hash.
|
*/

export function createLeadPayloadHash(payload) {
  const normalized = normalizeValue(payload);

  const serialized = JSON.stringify(normalized);

  return crypto
    .createHash("sha256")
    .update(serialized, "utf8")
    .digest("hex");
}