import { input, password } from '@inquirer/prompts';
import db from '../src/database/knex.js';
import {
  hashPassword,
  validatePassword,
} from '../src/modules/auth/password.service.js';

function validateName(value) {
  const name = value.trim();

  if (name.length < 2 || name.length > 150) {
    return 'Enter a name between 2 and 150 characters.';
  }

  return true;
}

function validateEmail(value) {
  const email = value.trim().toLowerCase();

  if (
    email.length > 190 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return 'Enter a valid email address, up to 190 characters.';
  }

  return true;
}

async function createAdmin() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'Run this command in an interactive terminal, such as VS Code Terminal.',
    );
  }

  await db.raw('SELECT 1').timeout(5000);

  const usersTableExists = await db.schema.hasTable('users');

  if (!usersTableExists) {
    throw new Error(
      'The users table is missing. Run npm run db:migrate -w server first.',
    );
  }

  console.log('\nCreate a Tempest Leads Super Admin\n');

  const name = (
    await input({
      message: 'Full name:',
      validate: validateName,
    })
  ).trim();

  const email = (
    await input({
      message: 'Email address:',
      validate: validateEmail,
    })
  )
    .trim()
    .toLowerCase();

  const existingUser = await db('users')
    .select('id')
    .where({ email })
    .first();

  if (existingUser) {
    throw new Error(
      'An account already exists with this email. No changes were made.',
    );
  }

  const adminPassword = await password({
    message: 'Password (15–128 characters):',
    mask: '*',
    validate: validatePassword,
  });

  await password({
    message: 'Confirm password:',
    mask: '*',
    validate: (value) =>
      value === adminPassword || 'Passwords do not match.',
  });

  const passwordHash = await hashPassword(adminPassword);

  await db('users').insert({
    name,
    email,
    password_hash: passwordHash,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    session_version: 1,
    password_changed_at: db.fn.now(3),
    created_at: db.fn.now(3),
    updated_at: db.fn.now(3),
  });

  console.log('\nSuper Admin created successfully.');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log('Role: SUPER_ADMIN');
  console.log('Status: ACTIVE');
}

try {
  await createAdmin();
} catch (error) {
  if (error.name === 'ExitPromptError') {
    console.log('\nAccount creation cancelled.');
  } else if (error.code === 'ER_DUP_ENTRY') {
    console.error('\nAn account already exists with this email.');
  } else if (error.code) {
    // Do not print database queries or their bound values.
    console.error(`\nAccount creation failed (${error.code}).`);
    console.error('Check that MySQL is running and migrations are complete.');
  } else {
    console.error(`\n${error.message || 'Account creation failed.'}`);
  }

  process.exitCode = 1;
} finally {
  await db.destroy();
}