import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";
import type { PublicCustomer } from "./auth.repository.js";
import type {
  CustomerListQuery,
  UpdateCustomerProfileInput,
} from "../validators/customer.validator.js";

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

interface CustomerEmailRow extends RowDataPacket {
  customer_id: number;
}

interface CustomerCountRow extends RowDataPacket {
  total: number;
}

export interface CustomerListResult {
  customers: PublicCustomer[];
  total: number;
}

const mapCustomer = (
  customer: CustomerRow,
): PublicCustomer => {
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

export const getCustomerById = async (
  customerId: number,
): Promise<PublicCustomer | null> => {
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
    [customerId],
  );

  const customer = rows[0];

  return customer ? mapCustomer(customer) : null;
};

export const findAnotherCustomerByEmail = async (
  email: string,
  customerId: number,
): Promise<{ customer_id: number } | null> => {
  const [rows] = await databasePool.execute<CustomerEmailRow[]>(
    `
      SELECT customer_id
      FROM customers
      WHERE email = ?
        AND customer_id <> ?
      LIMIT 1
    `,
    [email, customerId],
  );

  return rows[0] ?? null;
};

export const updateCustomerProfile = async (
  customerId: number,
  input: UpdateCustomerProfileInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.first_name !== undefined) {
    updates.push("first_name = ?");
    values.push(input.first_name);
  }

  if (input.last_name !== undefined) {
    updates.push("last_name = ?");
    values.push(input.last_name);
  }

  if (input.email !== undefined) {
    updates.push("email = ?");
    values.push(input.email);
  }

  if (input.phone !== undefined) {
    updates.push("phone = ?");
    values.push(input.phone);
  }

  if (input.preferred_branch_id !== undefined) {
    updates.push("preferred_branch_id = ?");
    values.push(input.preferred_branch_id);
  }

  if (input.avatar_url !== undefined) {
    updates.push("avatar_url = ?");
    values.push(input.avatar_url);
  }

  if (input.address !== undefined) {
    updates.push("address = ?");
    values.push(input.address);
  }

  values.push(customerId);

  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE customers
      SET ${updates.join(", ")}
      WHERE customer_id = ?
    `,
    values,
  );
};

export const listCustomers = async (
  query: CustomerListQuery,
): Promise<CustomerListResult> => {
  const conditions: string[] = [];
  const values: Array<string | number | boolean> = [];

  if (query.search !== undefined) {
    conditions.push(`
      (
        first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `);

    const searchPattern = `%${query.search}%`;

    values.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    );
  }

  if (query.is_active !== undefined) {
    conditions.push("is_active = ?");
    values.push(query.is_active);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const offset = (query.page - 1) * query.limit;

  const [customerRows] =
    await databasePool.execute<CustomerRow[]>(
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
        ${whereClause}
        ORDER BY created_at DESC, customer_id DESC
        LIMIT ?
        OFFSET ?
      `,
      [...values, query.limit, offset],
    );

  const [countRows] =
    await databasePool.execute<CustomerCountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM customers
        ${whereClause}
      `,
      values,
    );

  return {
    customers: customerRows.map(mapCustomer),
    total: countRows[0]?.total ?? 0,
  };
};

export const updateCustomerStatus = async (
  customerId: number,
  isActive: boolean,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE customers
        SET is_active = ?
        WHERE customer_id = ?
      `,
      [isActive, customerId],
    );

  return result.affectedRows > 0;
};