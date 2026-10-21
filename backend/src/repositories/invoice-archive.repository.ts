import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { databasePool } from "../config/database.js";

import type {
  CreateInvoiceArchiveInput,
  InvoiceArchiveQuery,
  UpdateInvoiceArchiveInput,
} from "../validators/invoice-archive.validator.js";

/* =========================================================
   TYPES
   ========================================================= */

export interface ArchivedInvoice {
  archive_id: number;
  customer_id: number | null;
  contact_id: number | null;
  title: string;
  invoice_number: string | null;
  invoice_date: Date;
  amount: string | number | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ArchivedInvoiceFile {
  file_id: number;
  archive_id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
  created_at: Date;
}

export interface NewArchivedInvoiceFile {
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
}

interface ArchivedInvoiceRow extends RowDataPacket, ArchivedInvoice {}

interface ArchivedInvoiceFileRow extends RowDataPacket, ArchivedInvoiceFile {}

interface ExistsRow extends RowDataPacket {
  id: number;
}

/* =========================================================
   FIND ARCHIVED INVOICE
   ========================================================= */

export const findArchivedInvoiceById = async (
  archiveId: number,
): Promise<ArchivedInvoice | null> => {
  const [rows] = await databasePool.execute<ArchivedInvoiceRow[]>(
    `
        SELECT
          archive_id,
          customer_id,
          contact_id,
          title,
          invoice_number,
          invoice_date,
          amount,
          description,
          created_at,
          updated_at
        FROM invoice_archive
        WHERE archive_id = ?
        LIMIT 1
      `,
    [archiveId],
  );

  return rows[0] ?? null;
};

/* =========================================================
   FIND FILES FOR AN INVOICE
   ========================================================= */

export const findArchivedInvoiceFiles = async (
  archiveId: number,
): Promise<ArchivedInvoiceFile[]> => {
  const [rows] = await databasePool.execute<ArchivedInvoiceFileRow[]>(
    `
        SELECT
          file_id,
          archive_id,
          original_name,
          stored_name,
          mime_type,
          file_size,
          created_at
        FROM invoice_archive_files
        WHERE archive_id = ?
        ORDER BY file_id ASC
      `,
    [archiveId],
  );

  return rows;
};

/* =========================================================
   FIND ONE FILE
   ========================================================= */

export const findArchivedInvoiceFileById = async (
  fileId: number,
): Promise<ArchivedInvoiceFile | null> => {
  const [rows] = await databasePool.execute<ArchivedInvoiceFileRow[]>(
    `
        SELECT
          file_id,
          archive_id,
          original_name,
          stored_name,
          mime_type,
          file_size,
          created_at
        FROM invoice_archive_files
        WHERE file_id = ?
        LIMIT 1
      `,
    [fileId],
  );

  return rows[0] ?? null;
};

/* =========================================================
   CHECK REGISTERED CUSTOMER
   ========================================================= */

export const archivedInvoiceCustomerExists = async (
  customerId: number,
): Promise<boolean> => {
  const [rows] = await databasePool.execute<ExistsRow[]>(
    `
      SELECT customer_id AS id
      FROM customers
      WHERE customer_id = ?
      LIMIT 1
    `,
    [customerId],
  );

  return rows.length > 0;
};

/* =========================================================
   CHECK INVOICE CONTACT
   ========================================================= */

export const archivedInvoiceContactExists = async (
  contactId: number,
): Promise<boolean> => {
  const [rows] = await databasePool.execute<ExistsRow[]>(
    `
      SELECT contact_id AS id
      FROM invoice_contacts
      WHERE contact_id = ?
      LIMIT 1
    `,
    [contactId],
  );

  return rows.length > 0;
};

/* =========================================================
   CREATE ARCHIVED INVOICE WITH ATTACHMENTS
   ========================================================= */

export const createArchivedInvoice = async (
  input: CreateInvoiceArchiveInput,
  files: NewArchivedInvoiceFile[],
): Promise<ArchivedInvoice> => {
  if (files.length === 0) {
    throw new Error("At least one invoice attachment is required.");
  }

  const connection = await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    // Create the archived invoice record.
    const [result] = await connection.execute<ResultSetHeader>(
      `
          INSERT INTO invoice_archive (
            customer_id,
            contact_id,
            title,
            invoice_number,
            invoice_date,
            amount,
            description
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        input.customer_id ?? null,
        input.contact_id ?? null,
        input.title,
        input.invoice_number,
        input.invoice_date,
        input.amount,
        input.description,
      ],
    );

    const archiveId = result.insertId;

    // Save each attachment's metadata.
    for (const file of files) {
      await connection.execute<ResultSetHeader>(
        `
          INSERT INTO invoice_archive_files (
            archive_id,
            original_name,
            stored_name,
            mime_type,
            file_size
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          archiveId,
          file.original_name,
          file.stored_name,
          file.mime_type,
          file.file_size,
        ],
      );
    }

    await connection.commit();

    const invoice = await findArchivedInvoiceById(archiveId);

    if (!invoice) {
      throw new Error("The archived invoice could not be retrieved.");
    }

    return invoice;
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* =========================================================
   LIST ARCHIVED INVOICES
   ========================================================= */

/* =========================================================
   SEARCH AND LIST ARCHIVED INVOICES
   ========================================================= */

export const findArchivedInvoices = async (filters: InvoiceArchiveQuery) => {
  const {
    search,
    owner_type,
    customer_id,
    contact_id,
    date_from,
    date_to,
    page,
    limit,
  } = filters;

  const conditions: string[] = [];
  const values: Array<string | number> = [];

  // Search invoice details and owner information.
  if (search) {
    conditions.push(`
      (
        ia.title LIKE ?
        OR ia.invoice_number LIKE ?
        OR CONCAT_WS(' ', c.first_name, c.last_name) LIKE ?
        OR ic.name LIKE ?
        OR c.phone LIKE ?
        OR ic.phone LIKE ?
      )
    `);

    const term = `%${search}%`;

    values.push(term, term, term, term, term, term);
  }

  // Filter by owner type.
  if (owner_type === "registered_customer") {
    conditions.push("ia.customer_id IS NOT NULL");
  }

  if (owner_type === "walk_in_customer") {
    conditions.push("ic.contact_type = 'walk_in_customer'");
  }

  if (owner_type === "supplier") {
    conditions.push("ic.contact_type = 'supplier'");
  }

  if (owner_type === "customer") {
    conditions.push(`
    (
      ia.customer_id IS NOT NULL
      OR ic.contact_type = 'walk_in_customer'
    )
  `);
  }

  // Filter by a specific registered customer.
  if (customer_id) {
    conditions.push("ia.customer_id = ?");
    values.push(customer_id);
  }

  // Filter by a specific supplier or walk-in customer.
  if (contact_id) {
    conditions.push("ia.contact_id = ?");
    values.push(contact_id);
  }

  // Filter by invoice date.
  if (date_from) {
    conditions.push("ia.invoice_date >= ?");
    values.push(date_from);
  }

  if (date_to) {
    conditions.push("ia.invoice_date <= ?");
    values.push(date_to);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const fromClause = `
    FROM invoice_archive ia

    LEFT JOIN customers c
      ON c.customer_id = ia.customer_id

    LEFT JOIN invoice_contacts ic
      ON ic.contact_id = ia.contact_id

    ${whereClause}
  `;

  // Count matching invoices.
  const [countRows] = await databasePool.query(
    `
      SELECT COUNT(*) AS total
      ${fromClause}
    `,
    values,
  );

  const total = Number((countRows as Array<{ total: number }>)[0]?.total ?? 0);

  const offset = (page - 1) * limit;

  // Retrieve the requested page.
  const [rows] = await databasePool.query(
    `
      SELECT
        ia.archive_id,
        ia.customer_id,
        ia.contact_id,
        ia.title,
        ia.invoice_number,
        ia.invoice_date,
        ia.amount,
        ia.description,
        ia.created_at,
        ia.updated_at,

        CASE
          WHEN ia.customer_id IS NOT NULL
            THEN 'registered_customer'
          ELSE ic.contact_type
        END AS owner_type,

        CASE
          WHEN ia.customer_id IS NOT NULL
            THEN CONCAT_WS(' ', c.first_name, c.last_name)
          ELSE ic.name
        END AS owner_name,

        CASE
          WHEN ia.customer_id IS NOT NULL
            THEN c.phone
          ELSE ic.phone
        END AS owner_phone,

        (
          SELECT COUNT(*)
          FROM invoice_archive_files iaf
          WHERE iaf.archive_id = ia.archive_id
        ) AS file_count

      ${fromClause}

      ORDER BY
        ia.invoice_date DESC,
        ia.archive_id DESC

      LIMIT ?
      OFFSET ?
    `,
    [...values, limit, offset],
  );

  return {
    invoices: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =========================================================
   UPDATE ARCHIVED INVOICE INFORMATION
   ========================================================= */

export const updateArchivedInvoice = async (
  archiveId: number,
  input: UpdateInvoiceArchiveInput,
): Promise<void> => {
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    values.push(input.title);
  }

  if (input.invoice_number !== undefined) {
    updates.push("invoice_number = ?");
    values.push(input.invoice_number);
  }

  if (input.invoice_date !== undefined) {
    updates.push("invoice_date = ?");
    values.push(input.invoice_date);
  }

  if (input.amount !== undefined) {
    updates.push("amount = ?");
    values.push(input.amount);
  }

  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }

  if (updates.length === 0) {
    return;
  }

  values.push(archiveId);

  await databasePool.execute(
    `
      UPDATE invoice_archive
      SET ${updates.join(", ")}
      WHERE archive_id = ?
    `,
    values,
  );
};

/* =========================================================
   DELETE ARCHIVED INVOICE
   ========================================================= */

export const deleteArchivedInvoice = async (
  archiveId: number,
): Promise<boolean> => {
  const [result] = await databasePool.execute(
    `
      DELETE FROM invoice_archive
      WHERE archive_id = ?
    `,
    [archiveId],
  );

  const deleteResult = result as {
    affectedRows: number;
  };

  return deleteResult.affectedRows > 0;
};
