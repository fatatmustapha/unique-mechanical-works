import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { databasePool } from "../config/database.js";

import type {
  CreateInvoiceContactInput,
  InvoiceContactsQuery,
  InvoiceContactType,
  UpdateInvoiceContactInput,
} from "../validators/invoice-contact.validator.js";

/* =========================================================
   TYPES
   ========================================================= */

export interface InvoiceContact {
  contact_id: number;
  contact_type: InvoiceContactType;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface InvoiceContactRow
  extends RowDataPacket,
    InvoiceContact {}

interface CountRow extends RowDataPacket {
  total: number;
}

export interface InvoiceContactsResult {
  contacts: InvoiceContact[];
  total: number;
}

/* =========================================================
   CREATE CONTACT
   ========================================================= */

export const createInvoiceContact = async (
  input: CreateInvoiceContactInput,
): Promise<InvoiceContact> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        INSERT INTO invoice_contacts (
          contact_type,
          name,
          phone,
          address,
          notes
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.contact_type,
        input.name,
        input.phone ?? null,
        input.address ?? null,
        input.notes ?? null,
      ],
    );

  const contact = await findInvoiceContactById(
    result.insertId,
  );

  if (!contact) {
    throw new Error(
      "Failed to retrieve the newly created invoice contact.",
    );
  }

  return contact;
};

/* =========================================================
   GET CONTACT BY ID
   ========================================================= */

export const findInvoiceContactById = async (
  contactId: number,
): Promise<InvoiceContact | null> => {
  const [rows] =
    await databasePool.execute<InvoiceContactRow[]>(
      `
        SELECT
          contact_id,
          contact_type,
          name,
          phone,
          address,
          notes,
          created_at,
          updated_at
        FROM invoice_contacts
        WHERE contact_id = ?
        LIMIT 1
      `,
      [contactId],
    );

  return rows[0] ?? null;
};

/* =========================================================
   LIST / SEARCH CONTACTS
   ========================================================= */

export const findInvoiceContacts = async (
  query: InvoiceContactsQuery,
): Promise<InvoiceContactsResult> => {
  const conditions: string[] = [];

  const values: Array<string | number> = [];

  if (query.contact_type !== undefined) {
    conditions.push("contact_type = ?");
    values.push(query.contact_type);
  }

  if (query.search !== undefined && query.search !== "") {
    conditions.push(
      "(name LIKE ? OR phone LIKE ?)",
    );

    const searchPattern = `%${query.search}%`;

    values.push(searchPattern, searchPattern);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const offset = (query.page - 1) * query.limit;

  const [rows] =
    await databasePool.execute<InvoiceContactRow[]>(
      `
        SELECT
          contact_id,
          contact_type,
          name,
          phone,
          address,
          notes,
          created_at,
          updated_at
        FROM invoice_contacts
        ${whereClause}
        ORDER BY name ASC, contact_id DESC
        LIMIT ?
        OFFSET ?
      `,
      [...values, query.limit, offset],
    );

  const [countRows] =
    await databasePool.execute<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM invoice_contacts
        ${whereClause}
      `,
      values,
    );

  return {
    contacts: rows,
    total: countRows[0]?.total ?? 0,
  };
};

/* =========================================================
   UPDATE CONTACT
   ========================================================= */

export const updateInvoiceContact = async (
  contactId: number,
  input: UpdateInvoiceContactInput,
): Promise<boolean> => {
  const updates: string[] = [];

  const values: Array<string | number | null> = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.phone !== undefined) {
    updates.push("phone = ?");
    values.push(input.phone);
  }

  if (input.address !== undefined) {
    updates.push("address = ?");
    values.push(input.address);
  }

  if (input.notes !== undefined) {
    updates.push("notes = ?");
    values.push(input.notes);
  }

  if (updates.length === 0) {
    return false;
  }

  values.push(contactId);

  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        UPDATE invoice_contacts
        SET ${updates.join(", ")}
        WHERE contact_id = ?
      `,
      values,
    );

  return result.affectedRows > 0;
};

/* =========================================================
   DELETE CONTACT
   ========================================================= */

export const deleteInvoiceContact = async (
  contactId: number,
): Promise<boolean> => {
  const [result] =
    await databasePool.execute<ResultSetHeader>(
      `
        DELETE FROM invoice_contacts
        WHERE contact_id = ?
      `,
      [contactId],
    );

  return result.affectedRows > 0;
};

/* =========================================================
   COUNT CONTACT INVOICES
   ========================================================= */

export const countInvoicesForContact = async (
  contactId: number,
): Promise<number> => {
  const [rows] =
    await databasePool.execute<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM invoice_archive
        WHERE contact_id = ?
      `,
      [contactId],
    );

  return rows[0]?.total ?? 0;
};