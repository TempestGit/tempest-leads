import db from '../../database/knex.js';

function scopedQuery(user) {
  const query = db('contacts as ct')
    .join('companies as c', 'c.id', 'ct.company_id')
    .join('users as u', 'u.id', 'ct.owner_id');

  if (user.role !== 'SUPER_ADMIN') {
    query.where(function () {
      this.where('ct.owner_id', user.id)
        .orWhere('c.owner_id', user.id);
    });
  }

  return query;
}

export async function listContacts(user, filters) {
  const { company_id, search, page, limit } = filters;
  const query = scopedQuery(user);

  if (company_id) {
    query.andWhere('ct.company_id', company_id);
  }

  if (search) {
    const pattern = `%${search.replace(/[!%_]/g, '!$&')}%`;

    query.andWhere(function () {
      this.whereRaw("ct.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.email LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.phone LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.whatsapp LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.name LIKE ? ESCAPE '!'", [pattern]);
    });
  }

  const count = await query
    .clone()
    .count({ total: 'ct.id' })
    .first();

  const rows = await query
    .clone()
    .select(
      'ct.id',
      'ct.contact_code',
      'ct.company_id',
      'ct.name',
      'ct.designation',
      'ct.department',
      'ct.phone',
      'ct.whatsapp',
      'ct.email',
      'ct.linkedin',
      'ct.decision_maker',
      'ct.communication_status',
      'ct.notes',
      'c.name as company_name',
      'u.name as owner_name',
    )
    .orderBy('ct.id', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  const total = Number(count.total);

  return {
    data: rows.map((row) => ({
      ...row,
      id: String(row.id),
      company_id: String(row.company_id),
      decision_maker: Boolean(Number(row.decision_maker)),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function insertContact(user, values) {
  return db.transaction(async (trx) => {
    const companyQuery = trx('companies')
      .where({ id: values.company_id });

    if (user.role !== 'SUPER_ADMIN') {
      companyQuery.andWhere('owner_id', user.id);
    }

    const company = await companyQuery.forUpdate().first();

    if (!company) {
      const error = new Error(
        'Company not found or you do not have access.',
      );

      error.code = 'CONTACT_COMPANY_FORBIDDEN';
      throw error;
    }

    await trx('contacts').insert({
      ...values,
      owner_id: company.owner_id,
      created_by: user.id,
      communication_status: 'UNKNOWN',
    });

    const contact = await trx('contacts')
      .select('id', 'name', 'contact_code', 'company_id')
      .where({ contact_code: values.contact_code })
      .first();

    return {
      ...contact,
      id: String(contact.id),
      company_id: String(contact.company_id),
    };
  });
}