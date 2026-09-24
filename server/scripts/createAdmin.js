import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import pool from "../src/config/db.js";

const getArgument = (
  name
) => {
  const prefix =
    `--${name}=`;

  const argument =
    process.argv.find(
      (value) =>
        value.startsWith(
          prefix
        )
    );

  if (!argument) {
    return null;
  }

  return argument.slice(
    prefix.length
  );
};

const generateUserCode =
  () => {
    return (
      "USR-" +
      crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase()
    );
  };

const run = async () => {
  try {
    const name =
      getArgument("name");

    const email =
      getArgument("email")
        ?.trim()
        .toLowerCase();

    const password =
      getArgument("password");

    if (
      !name ||
      !email ||
      !password
    ) {
      throw new Error(
        `
Usage:

npm run create:admin -- --name="Admin Name" --email="admin@example.com" --password="YourSecurePassword"
        `.trim()
      );
    }

    if (
      password.length < 8
    ) {
      throw new Error(
        "Password must contain at least 8 characters."
      );
    }

    const [existing] =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [email]
      );

    if (existing.length) {
      throw new Error(
        "A user with this email already exists."
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const userCode =
      generateUserCode();

    const [result] =
      await pool.query(
        `
          INSERT INTO users (
            user_code,
            full_name,
            email,
            password_hash,
            role,
            status
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            'SUPER_ADMIN',
            'ACTIVE'
          )
        `,
        [
          userCode,
          name,
          email,
          passwordHash,
        ]
      );

    console.log(
      "Super Admin created successfully."
    );

    console.log({
      id: result.insertId,
      userCode,
      name,
      email,
      role: "SUPER_ADMIN",
    });
  } catch (error) {
    console.error(
      "Failed to create admin:"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();