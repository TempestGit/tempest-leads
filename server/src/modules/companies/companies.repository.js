import crypto from "node:crypto";

import pool from "../../config/db.js";

const COMPANY_SELECT = `
  SELECT
    c.id,

    c.company_code AS companyCode,

    c.name,

    c.industry,

    c.city,

    c.state,

    c.country,

    c.website,

    c.agency_relationship AS agencyRelationship,

    c.source,

    c.status,

    c.notes,

    c.created_by AS createdBy,

    c.updated_by AS updatedBy,

    c.created_at AS createdAt,

    c.updated_at AS updatedAt,

    (
      SELECT COUNT(*)

      FROM contacts ct

      WHERE ct.company_id = c.id
        AND ct.deleted_at IS NULL

    ) AS contactsCount,

    (
      SELECT l.stage

      FROM leads l

      WHERE l.company_id = c.id
        AND l.deleted_at IS NULL

      ORDER BY
        l.updated_at DESC,
        l.id DESC

      LIMIT 1

    ) AS currentStage

  FROM companies c
`;

export const findCompanyById = async (companyId, connection = pool) => {
  const [rows] = await connection.query(
    `
        ${COMPANY_SELECT}

        WHERE c.id = ?
          AND c.deleted_at IS NULL

        LIMIT 1
      `,
    [companyId],
  );

  if (!rows[0]) {
    return null;
  }

  return {
    ...rows[0],

    contactsCount: Number(rows[0].contactsCount || 0),
  };
};

export const findCompanyByName = async (
  name,
  excludeId = null,
  connection = pool,
) => {
  const values = [name];

  let sql = `
      ${COMPANY_SELECT}

      WHERE LOWER(c.name) = LOWER(?)
        AND c.deleted_at IS NULL
    `;

  if (excludeId) {
    sql += `
        AND c.id <> ?
      `;

    values.push(excludeId);
  }

  sql += `
      LIMIT 1
    `;

  const [rows] = await connection.query(sql, values);

  return rows[0] || null;
};

export const listCompanies = async ({
  search = "",
  status,
  industry,
  city,
  page = 1,
  limit = 20,
  sort = "createdAt",
  direction = "asc",
  userId,
  role,
}) => {
  const conditions = ["c.deleted_at IS NULL"];

  const values = [];

  if (role !== "SUPER_ADMIN") {
    conditions.push(`
        (
          c.created_by = ?
          OR EXISTS (
            SELECT 1

            FROM leads l

            WHERE l.company_id = c.id
              AND l.owner_id = ?
              AND l.deleted_at IS NULL
          )
        )
      `);

    // A company the user created stays visible to them even before
    // they own a lead on it.
    values.push(userId, userId);
  }

  if (search) {
    const term = `%${search}%`;

    conditions.push(`
        (
          c.company_code LIKE ?
          OR c.name LIKE ?
          OR c.industry LIKE ?
          OR c.city LIKE ?
          OR c.website LIKE ?
          OR c.agency_relationship LIKE ?
          OR c.source LIKE ?
        )
      `);

    values.push(term, term, term, term, term, term, term);
  }

  if (status) {
    conditions.push("c.status = ?");

    values.push(status);
  }

  if (industry) {
    conditions.push("c.industry = ?");

    values.push(industry);
  }

  if (city) {
    conditions.push("c.city = ?");

    values.push(city);
  }

  const whereClause = conditions.join(" AND ");

  const [countRows] = await pool.query(
    `
          SELECT
            COUNT(*) AS total

          FROM companies c

          WHERE ${whereClause}
        `,
    values,
  );

  const total = Number(countRows[0]?.total || 0);

  const sortColumns = {
    name: "c.name",

    createdAt: "c.created_at",

    updatedAt: "c.updated_at",

    city: "c.city",

    industry: "c.industry",
  };

  const orderColumn = sortColumns[sort] || "c.created_at";

  const orderDirection = direction === "desc" ? "DESC" : "ASC";

  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `
          ${COMPANY_SELECT}

          WHERE ${whereClause}

          ORDER BY
            ${orderColumn}
            ${orderDirection},
            c.id ASC

          LIMIT ?
          OFFSET ?
        `,
    [...values, Number(limit), Number(offset)],
  );

  return {
    rows: rows.map((company) => ({
      ...company,

      contactsCount: Number(company.contactsCount || 0),
    })),

    total,
  };
};

export const createCompany = async (
  {
    name,
    industry,
    city,
    website,
    agencyRelationship,
    notes = null,

    country = "India",

    source = "Other",

    status = "ACTIVE",

    userId,
  },
  connection = pool,
) => {
  const temporaryCode = `TEMP-${crypto.randomBytes(12).toString("hex")}`;

  const [result] = await connection.query(
    `
          INSERT INTO companies (
            company_code,
            name,
            industry,
            city,
            state,
            country,
            website,
            agency_relationship,
            source,
            status,
            notes,
            created_by,
            updated_by
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            NULL,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `,
    [
      temporaryCode,
      name,
      industry,
      city,
      country,
      website,
      agencyRelationship,
      source,
      status,
      notes,
      userId,
      userId,
    ],
  );

  return result.insertId;
};

export const updateCompanyCode = async (
  companyId,
  companyCode,
  connection = pool,
) => {
  const [result] = await connection.query(
    `
          UPDATE companies

          SET
            company_code = ?

          WHERE id = ?
            AND deleted_at IS NULL
        `,
    [companyCode, companyId],
  );

  return result.affectedRows > 0;
};

export const updateCompany = async (
  companyId,
  data,
  userId,
  connection = pool,
) => {
  const columnMap = {
    name: "name",

    industry: "industry",

    city: "city",

    state: "state",

    country: "country",

    website: "website",

    agencyRelationship: "agency_relationship",

    source: "source",

    status: "status",

    notes: "notes",
  };

  const assignments = [];

  const values = [];

  for (const [key, value] of Object.entries(data)) {
    const column = columnMap[key];

    if (!column) {
      continue;
    }

    assignments.push(`${column} = ?`);

    values.push(value);
  }

  assignments.push("updated_by = ?");

  values.push(userId);

  values.push(companyId);

  const [result] = await connection.query(
    `
          UPDATE companies

          SET
            ${assignments.join(", ")}

          WHERE id = ?
            AND deleted_at IS NULL
        `,
    values,
  );

  return result.affectedRows > 0;
};

export const getCompanyDependencies = async (companyId, connection = pool) => {
  const [contactRows] = await connection.query(
    `
          SELECT
            COUNT(*) AS total

          FROM contacts

          WHERE company_id = ?
            AND deleted_at IS NULL
        `,
    [companyId],
  );

  const [leadRows] = await connection.query(
    `
          SELECT
            COUNT(*) AS total

          FROM leads

          WHERE company_id = ?
            AND deleted_at IS NULL
        `,
    [companyId],
  );

  return {
    contacts: Number(contactRows[0]?.total || 0),

    leads: Number(leadRows[0]?.total || 0),
  };
};

export const softDeleteCompany = async (
  companyId,
  userId,
  connection = pool,
) => {
  const [result] = await connection.query(
    `
          UPDATE companies

          SET
            deleted_at =
              UTC_TIMESTAMP(),

            updated_by = ?

          WHERE id = ?
            AND deleted_at IS NULL
        `,
    [userId, companyId],
  );

  return result.affectedRows > 0;
};

export const canUserAccessCompany = async (
  { companyId, userId, role },
  connection = pool,
) => {
  if (role === "SUPER_ADMIN") {
    return true;
  }

  const [rows] = await connection.query(
    `
        SELECT 1
        FROM companies c
        WHERE c.id = ?
          AND c.deleted_at IS NULL
          AND (
            c.created_by = ?
            OR EXISTS (
              SELECT 1
              FROM leads l
              WHERE l.company_id = c.id
                AND l.owner_id = ?
                AND l.deleted_at IS NULL
            )
          )
        LIMIT 1
      `,
    [companyId, userId, userId],
  );

  return rows.length > 0;
};