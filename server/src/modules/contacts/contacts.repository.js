import db from '../../database/knex.js';

function scopedQuery(user, connection = db) {
  const query = connection('contacts as ct')
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

function serializeContactDetail(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    id: String(row.id),
    company_id: String(row.company_id),
    owner_id: String(row.owner_id),
    created_by: String(row.created_by),
    decision_maker: Boolean(Number(row.decision_maker)),
    version: Number(row.version),
  };
}

/*
 * Returns null for missing or inaccessible contacts.
 */
export async function findContact(user, id, connection = db) {
  const row = await scopedQuery(user, connection)
    .join('users as creator', 'creator.id', 'ct.created_by')
    .where('ct.id', id)
    .select(
      'ct.id',
      'ct.contact_code',
      'ct.company_id',
      'c.name as company_name',
      'c.company_code',
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
      'ct.owner_id',
      'u.name as owner_name',
      'ct.created_by',
      'creator.name as created_by_name',
      'ct.version',
      'ct.created_at',
      'ct.updated_at',
    )
    .first();

  return serializeContactDetail(row);
}

const editableContactFields = [
  'name',
  'designation',
  'department',
  'phone',
  'whatsapp',
  'email',
  'linkedin',
  'decision_maker',
  'notes',
];

function contactProfileSnapshot(contact) {
  return Object.fromEntries(
    editableContactFields.map((field) => [
      field,
      contact[field],
    ]),
  );
}

/*
 * Only validated, complete profile values should reach this function.
 *
 * Returns:
 * { status: 'not_found' }
 * { status: 'conflict' }
 * { status: 'updated', contact }
 */
export async function updateContactRecord(
  user,
  id,
  expectedVersion,
  values,
) {
  const updates = {};

  for (const field of editableContactFields) {
    if (values[field] === undefined) {
      throw new Error(
        `Missing required contact update field: ${field}`,
      );
    }

    updates[field] = values[field];
  }

  return db.transaction(async (trx) => {
    // Lock the contact and joined ownership records.
    const lockedContact = await scopedQuery(user, trx)
      .where('ct.id', id)
      .select('ct.id', 'ct.version')
      .forUpdate()
      .first();

    if (!lockedContact) {
      return { status: 'not_found' };
    }

    const currentVersion = Number(lockedContact.version);

    if (currentVersion !== expectedVersion) {
      return { status: 'conflict' };
    }

    const previousContact = await findContact(user, id, trx);

    if (!previousContact) {
      return { status: 'not_found' };
    }

    const nextVersion = currentVersion + 1;

    const affectedRows = await trx('contacts')
      .where({
        id,
        version: currentVersion,
      })
      .update({
        ...updates,
        version: nextVersion,
        updated_at: trx.raw('CURRENT_TIMESTAMP(3)'),
      });

    if (affectedRows !== 1) {
      throw new Error(
        'Contact update did not affect exactly one record.',
      );
    }

    const updatedContact = await findContact(user, id, trx);

    if (!updatedContact) {
      throw new Error('Unable to load the updated contact.');
    }

    // The update and history entry commit or roll back together.
    await trx('contact_change_history').insert({
      contact_id: id,
      actor_id: user.id,
      previous_version: currentVersion,
      new_version: nextVersion,
      previous_values: JSON.stringify(
        contactProfileSnapshot(previousContact),
      ),
      new_values: JSON.stringify(
        contactProfileSnapshot(updatedContact),
      ),
    });

    return {
      status: 'updated',
      contact: updatedContact,
    };
  });
}