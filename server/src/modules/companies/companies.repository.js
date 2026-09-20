import db from '../../database/knex.js';

function scopedQuery(user) {
  const query = db('companies as c')
    .join('users as u', 'u.id', 'c.owner_id');

  if (user.role !== 'SUPER_ADMIN') {
    query.where('c.owner_id', user.id);
  }

  return query;
}

export async function listCompanies(user, filters) {
  const { search, page, limit } = filters;
  const query = scopedQuery(user);

  if (search) {
    // Escape SQL LIKE wildcard characters for literal search.
    const escaped = search.replace(/[!%_]/g, '!$&');
    const pattern = `%${escaped}%`;

    query.andWhere(function () {
      this.whereRaw("c.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.company_code LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.city LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.industry LIKE ? ESCAPE '!'", [pattern]);
    });
  }

  const count = await query
    .clone()
    .count({ total: 'c.id' })
    .first();

  const rows = await query
    .clone()
    .select(
      'c.id',
      'c.company_code',
      'c.name',
      'c.industry',
      'c.city',
      'c.website',
      'c.status',
      'c.created_at',
      'u.name as owner_name',
    )
    .orderBy('c.id', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  const total = Number(count.total);

  return {
    data: rows.map((row) => ({
      ...row,
      id: String(row.id),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function insertCompany(values) {
  await db('companies').insert(values);

  const company = await db('companies')
    .select('id', 'company_code', 'name')
    .where({ company_code: values.company_code })
    .first();

  return {
    ...company,
    id: String(company.id),
  };
}

export async function findCompany(user, id, connection = db) {
  const query = connection('companies as c')
    .join('users as owner', 'owner.id', 'c.owner_id')
    .join('users as creator', 'creator.id', 'c.created_by')
    .where('c.id', id);

  if (user.role !== 'SUPER_ADMIN') {
    query.where('c.owner_id', user.id);
  }

  const company = await query
    .select(
      'c.id',
      'c.company_code',
      'c.name',
      'c.industry',
      'c.sub_industry',
      'c.city',
      'c.geography',
      'c.website',
      'c.existing_agency',
      'c.marketing_activity',
      'c.potential_requirement',
      'c.lead_source',
      'c.status',
      'c.owner_id',
      'c.created_by',
      'c.version',
      'c.created_at',
      'c.updated_at',
      'owner.name as owner_name',
      'creator.name as created_by_name',
      connection.raw(
        "DATE_FORMAT(c.reconnect_date, '%Y-%m-%d') AS reconnect_date",
      ),
    )
    .first();

  if (!company) return null;

  return {
    ...company,
    id: String(company.id),
    owner_id: String(company.owner_id),
    created_by: String(company.created_by),
    version: Number(company.version),
  };
}

function companyError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export async function updateCompanyRecord(user, id, version, values) {
  return db.transaction(async (trx) => {
    const query = trx('companies').where({ id });

    if (user.role !== 'SUPER_ADMIN') {
      query.where('owner_id', user.id);
    }

    // Lock the record while checking its version and applying the edit.
    const existing = await query.forUpdate().first();

    if (!existing) {
      throw companyError(
        'Company not found or you do not have access.',
        404,
        'COMPANY_NOT_FOUND',
      );
    }

    if (Number(existing.version) !== version) {
      throw companyError(
        'This company has changed since you opened it. Reload the latest details before editing again.',
        409,
        'COMPANY_VERSION_CONFLICT',
      );
    }

    const previous = await findCompany(user, id, trx);

    await trx('companies')
      .where({ id, version })
      .update({
        ...values,
        version: version + 1,
        updated_at: trx.fn.now(3),
      });

    const updated = await findCompany(user, id, trx);

    await trx('company_change_history').insert({
      company_id: id,
      actor_id: user.id,
      previous_version: version,
      new_version: version + 1,
      previous_values: JSON.stringify(previous),
      new_values: JSON.stringify(updated),
      created_at: trx.fn.now(3),
    });

    return updated;
  });
}