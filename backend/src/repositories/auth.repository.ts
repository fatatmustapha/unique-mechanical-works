import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";
import type { AdminRole } from "../types/auth.js";
import type { CustomerRegistrationInput } from "../validators/auth.validator.js";

interface CustomerEmailRow extends RowDataPacket {
  customer_id: number;
}

interface BranchRow extends RowDataPacket {
  branch_id: number;
}

interface CustomerRow extends RowDataPacket {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_branch_id: number | null;
  avatar_url: string | null;
  address: string | null;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

interface CustomerLoginRow extends CustomerRow {
  password_hash: string;
}

interface AdminLoginRow extends RowDataPacket {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  branch_id: number | null;
  role: AdminRole;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

export interface PublicCustomer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_branch_id: number | null;
  avatar_url: string | null;
  address: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerForLogin extends PublicCustomer {
  password_hash: string;
}

export interface PublicAdmin {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  branch_id: number | null;
  role: AdminRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AdminForLogin extends PublicAdmin {
  password_hash: string;
}

export interface CreateCustomerData extends CustomerRegistrationInput {
  password_hash: string;
}

const mapPublicCustomer = (customer: CustomerRow): PublicCustomer => {
  return {
    customer_id: customer.customer_id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    preferred_branch_id: customer.preferred_branch_id,
    avatar_url: customer.avatar_url,
    address: customer.address,
    is_active: customer.is_active === 1,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
  };
};

const mapPublicAdmin = (admin: AdminLoginRow): PublicAdmin => {
  return {
    admin_id: admin.admin_id,
    first_name: admin.first_name,
    last_name: admin.last_name,
    email: admin.email,
    branch_id: admin.branch_id,
    role: admin.role,
    is_active: admin.is_active === 1,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
};

export const findCustomerByEmail = async (
  email: string,
): Promise<{ customer_id: number } | null> => {
  const [rows] = await databasePool.execute<CustomerEmailRow[]>(
    `
      SELECT customer_id
      FROM customers
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
};

export const findCustomerForLogin = async (
  email: string,
): Promise<CustomerForLogin | null> => {
  const [rows] = await databasePool.execute<CustomerLoginRow[]>(
    `
      SELECT
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        preferred_branch_id,
        avatar_url,
        address,
        is_active,
        created_at,
        updated_at
      FROM customers
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  const customer = rows[0];

  if (!customer) {
    return null;
  }

  return {
    ...mapPublicCustomer(customer),
    password_hash: customer.password_hash,
  };
};

export const findActiveBranchById = async (
  branchId: number,
): Promise<{ branch_id: number } | null> => {
  const [rows] = await databasePool.execute<BranchRow[]>(
    `
      SELECT branch_id
      FROM branches
      WHERE branch_id = ?
        AND is_active = 1
      LIMIT 1
    `,
    [branchId],
  );

  return rows[0] ?? null;
};

export const createCustomer = async (
  data: CreateCustomerData,
): Promise<PublicCustomer> => {
  const [result] = await databasePool.execute<ResultSetHeader>(
    `
      INSERT INTO customers (
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        preferred_branch_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.phone ?? null,
      data.password_hash,
      data.preferred_branch_id ?? null,
    ],
  );

  const [rows] = await databasePool.execute<CustomerRow[]>(
    `
      SELECT
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        preferred_branch_id,
        avatar_url,
        address,
        is_active,
        created_at,
        updated_at
      FROM customers
      WHERE customer_id = ?
      LIMIT 1
    `,
    [result.insertId],
  );

  const customer = rows[0];

  if (!customer) {
    throw new Error("The newly created customer could not be retrieved.");
  }

  return mapPublicCustomer(customer);
};

export const updateCustomerLastLogin = async (
  customerId: number,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE customers
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE customer_id = ?
    `,
    [customerId],
  );
};

export const findAdminForLogin = async (
  email: string,
): Promise<AdminForLogin | null> => {
  const [rows] = await databasePool.execute<AdminLoginRow[]>(
    `
      SELECT
        admin_id,
        first_name,
        last_name,
        email,
        password_hash,
        branch_id,
        role,
        is_active,
        created_at,
        updated_at
      FROM admins
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  const admin = rows[0];

  if (!admin) {
    return null;
  }

  return {
    ...mapPublicAdmin(admin),
    password_hash: admin.password_hash,
  };
};

export const updateAdminLastLogin = async (
  adminId: number,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE admins
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE admin_id = ?
    `,
    [adminId],
  );
};