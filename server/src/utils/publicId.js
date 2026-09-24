import crypto from "node:crypto";

const generatePublicId = (
  prefix = "ID"
) => {
  const normalizedPrefix =
    String(prefix)
      .trim()
      .toUpperCase();

  const randomPart =
    crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase();

  return `${normalizedPrefix}-${randomPart}`;
};

export default generatePublicId;