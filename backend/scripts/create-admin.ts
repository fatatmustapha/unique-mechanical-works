import "dotenv/config";

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type AdminRole = "super_admin" | "branch_admin";

const readline = createInterface({
  input,
  output,
});

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

async function main() {
  let connection: mysql.Connection | undefined;

  try {
    console.log("\n================================");
    console.log(" Unique Mechanical Works");
    console.log(" Private Admin Creator");
    console.log("================================\n");

    const firstName = (
      await readline.question("First name: ")
    ).trim();

    const lastName = (
      await readline.question("Last name: ")
    ).trim();

    const email = (
      await readline.question("Email: ")
    )
      .trim()
      .toLowerCase();

    const password = await readline.question(
      "Password: ",
    );

    const roleInput = (
      await readline.question(
        "Role (super_admin / branch_admin): ",
      )
    )
      .trim()
      .toLowerCase();

    if (!firstName || !lastName || !email || !password) {
      throw new Error(
        "First name, last name, email and password are required.",
      );
    }

    if (
      roleInput !== "super_admin" &&
      roleInput !== "branch_admin"
    ) {
      throw new Error(
        'Role must be either "super_admin" or "branch_admin".',
      );
    }

    const role = roleInput as AdminRole;

    if (password.length < 12) {
      throw new Error(
        "Admin password must contain at least 12 characters.",
      );
    }

    let branchId: number | null = null;

    if (role === "branch_admin") {
      const branchInput = (
        await readline.question(
          "Branch ID for this admin: ",
        )
      ).trim();

      branchId = Number(branchInput);

      if (
        !Number.isInteger(branchId) ||
        branchId <= 0
      ) {
        throw new Error(
          "A valid branch ID is required for a branch admin.",
        );
      }
    }

    connection = await mysql.createConnection({
      host: requiredEnv("DB_HOST"),
      port: Number(process.env.DB_PORT ?? "3306"),
      user: requiredEnv("DB_USER"),
      password: process.env.DB_PASSWORD ?? "",
      database: requiredEnv("DB_NAME"),
    });

    console.log("\nConnected to the database.");

    const [existingAdmins] = await connection.execute<
      mysql.RowDataPacket[]
    >(
      `
        SELECT admin_id
        FROM admins
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

    if (existingAdmins.length > 0) {
      throw new Error(
        "An administrator with this email already exists.",
      );
    }

    if (branchId !== null) {
      const [branches] = await connection.execute<
        mysql.RowDataPacket[]
      >(
        `
          SELECT branch_id
          FROM branches
          WHERE branch_id = ?
          LIMIT 1
        `,
        [branchId],
      );

      if (branches.length === 0) {
        throw new Error(
          `No branch exists with ID ${branchId}.`,
        );
      }
    }

    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `
        INSERT INTO admins (
          first_name,
          last_name,
          email,
          password_hash,
          branch_id,
          role,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      [
        firstName,
        lastName,
        email,
        passwordHash,
        branchId,
        role,
      ],
    );

    console.log("\n================================");
    console.log(" ADMIN CREATED SUCCESSFULLY");
    console.log("================================");
    console.log(`Admin ID: ${result.insertId}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(
      `Branch ID: ${branchId ?? "All branches"}`,
    );
    console.log("Status: Active");
    console.log("================================\n");

    console.log(
      "The administrator can now sign in through the private Admin Portal.",
    );
  } catch (error) {
    console.error("\nCould not create admin.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    readline.close();

    if (connection) {
      await connection.end();
    }
  }
}

void main();