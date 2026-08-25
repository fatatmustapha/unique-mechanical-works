import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { databasePool } from "../config/database.js";
import type {
  CreateInvoiceInput,
  InvoiceItemInput,
  UpdateInvoiceInput,
} from "../validators/invoice.validator.js";

interface InvoiceRow extends RowDataPacket {
  invoice_id: number;
  invoice_number: string;

  customer_id: number;

  appointment_id: number | null;
  car_id: number | null;

  created_by_admin_id: number;

  subtotal: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  amount_paid: string | number;

  currency: string;

  payment_status: "pending" | "partial" | "paid";

  payment_method: string | null;

  issued_at: Date;
  due_date: Date | null;

  notes: string | null;

  created_at: Date;
  updated_at: Date;
}

interface InvoiceItemRow extends RowDataPacket {
  invoice_item_id: number;
  invoice_id: number;

  description: string;

  quantity: string | number;
  unit_price: string | number;
  line_total: string | number;

  created_at: Date;
}

interface InvoiceCountRow extends RowDataPacket {
  total: number;
}

export interface InvoiceItem {
  invoice_item_id: number;
  invoice_id: number;

  description: string;

  quantity: number;
  unit_price: number;
  line_total: number;

  created_at: Date;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;

  customer_id: number;

  appointment_id: number | null;
  car_id: number | null;

  created_by_admin_id: number;

  subtotal: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;

  currency: string;

  payment_status: "pending" | "partial" | "paid";

  payment_method: string | null;

  issued_at: Date;
  due_date: Date | null;

  notes: string | null;

  created_at: Date;
  updated_at: Date;

  items: InvoiceItem[];
}

export interface AdminInvoiceFilters {
  customerId?: number;

  paymentStatus?: "pending" | "partial" | "paid";

  page: number;
  limit: number;
}

interface InvoiceIdentityRow extends RowDataPacket {
  invoice_id: number;
}

export const findInvoiceByNumber = async (
  invoiceNumber: string,
): Promise<number | null> => {
  const [rows] = await databasePool.execute<InvoiceIdentityRow[]>(
    `
        SELECT invoice_id
        FROM invoices
        WHERE invoice_number = ?
        LIMIT 1
      `,
    [invoiceNumber],
  );

  return rows[0]?.invoice_id ?? null;
};

export interface AdminInvoicesResult {
  invoices: Invoice[];
  total: number;
}

const mapInvoiceRow = (row: InvoiceRow): Omit<Invoice, "items"> => ({
  invoice_id: row.invoice_id,
  invoice_number: row.invoice_number,

  customer_id: row.customer_id,

  appointment_id: row.appointment_id,
  car_id: row.car_id,

  created_by_admin_id: row.created_by_admin_id,

  subtotal: Number(row.subtotal),
  discount_amount: Number(row.discount_amount),
  total_amount: Number(row.total_amount),
  amount_paid: Number(row.amount_paid),

  currency: row.currency,

  payment_status: row.payment_status,

  payment_method: row.payment_method,

  issued_at: row.issued_at,
  due_date: row.due_date,

  notes: row.notes,

  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapInvoiceItem = (row: InvoiceItemRow): InvoiceItem => ({
  invoice_item_id: row.invoice_item_id,

  invoice_id: row.invoice_id,

  description: row.description,

  quantity: Number(row.quantity),
  unit_price: Number(row.unit_price),
  line_total: Number(row.line_total),

  created_at: row.created_at,
});

const calculateTotals = (items: InvoiceItemInput[], discountAmount: number) => {
  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.unit_price,
    0,
  );

  const totalAmount = Math.max(subtotal - discountAmount, 0);

  return {
    subtotal,
    totalAmount,
  };
};

export const findInvoiceItems = async (
  invoiceId: number,
): Promise<InvoiceItem[]> => {
  const [rows] = await databasePool.execute<InvoiceItemRow[]>(
    `
        SELECT
          invoice_item_id,
          invoice_id,
          description,
          quantity,
          unit_price,
          line_total,
          created_at

        FROM invoice_items

        WHERE invoice_id = ?

        ORDER BY invoice_item_id ASC
      `,
    [invoiceId],
  );

  return rows.map(mapInvoiceItem);
};

const findInvoiceBaseById = async (
  invoiceId: number,
): Promise<Omit<Invoice, "items"> | null> => {
  const [rows] = await databasePool.execute<InvoiceRow[]>(
    `
        SELECT
          invoice_id,
          invoice_number,
          customer_id,
          appointment_id,
          car_id,
          created_by_admin_id,
          subtotal,
          discount_amount,
          total_amount,
          amount_paid,
          currency,
          payment_status,
          payment_method,
          issued_at,
          due_date,
          notes,
          created_at,
          updated_at

        FROM invoices

        WHERE invoice_id = ?

        LIMIT 1
      `,
    [invoiceId],
  );

  const row = rows[0];

  return row ? mapInvoiceRow(row) : null;
};

export const findInvoiceById = async (
  invoiceId: number,
): Promise<Invoice | null> => {
  const invoice = await findInvoiceBaseById(invoiceId);

  if (!invoice) {
    return null;
  }

  const items = await findInvoiceItems(invoiceId);

  return {
    ...invoice,
    items,
  };
};

export const findCustomerInvoiceById = async (
  invoiceId: number,
  customerId: number,
): Promise<Invoice | null> => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice || invoice.customer_id !== customerId) {
    return null;
  }

  return invoice;
};

export const findCustomerInvoices = async (
  customerId: number,
): Promise<Invoice[]> => {
  const [rows] = await databasePool.execute<InvoiceRow[]>(
    `
        SELECT
          invoice_id,
          invoice_number,
          customer_id,
          appointment_id,
          car_id,
          created_by_admin_id,
          subtotal,
          discount_amount,
          total_amount,
          amount_paid,
          currency,
          payment_status,
          payment_method,
          issued_at,
          due_date,
          notes,
          created_at,
          updated_at

        FROM invoices

        WHERE customer_id = ?

        ORDER BY
          issued_at DESC,
          invoice_id DESC
      `,
    [customerId],
  );

  const invoices: Invoice[] = [];

  for (const row of rows) {
    const invoice = mapInvoiceRow(row);

    const items = await findInvoiceItems(invoice.invoice_id);

    invoices.push({
      ...invoice,
      items,
    });
  }

  return invoices;
};

export const findAdminInvoices = async (
  filters: AdminInvoiceFilters,
): Promise<AdminInvoicesResult> => {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.customerId !== undefined) {
    conditions.push("customer_id = ?");

    values.push(filters.customerId);
  }

  if (filters.paymentStatus !== undefined) {
    conditions.push("payment_status = ?");

    values.push(filters.paymentStatus);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const offset = (filters.page - 1) * filters.limit;

  const [rows] = await databasePool.execute<InvoiceRow[]>(
    `
        SELECT
          invoice_id,
          invoice_number,
          customer_id,
          appointment_id,
          car_id,
          created_by_admin_id,
          subtotal,
          discount_amount,
          total_amount,
          amount_paid,
          currency,
          payment_status,
          payment_method,
          issued_at,
          due_date,
          notes,
          created_at,
          updated_at

        FROM invoices

        ${whereClause}

        ORDER BY
          issued_at DESC,
          invoice_id DESC

        LIMIT ?
        OFFSET ?
      `,
    [...values, filters.limit, offset],
  );

  const [countRows] = await databasePool.execute<InvoiceCountRow[]>(
    `
        SELECT COUNT(*) AS total

        FROM invoices

        ${whereClause}
      `,
    values,
  );

  const invoices: Invoice[] = [];

  for (const row of rows) {
    const invoice = mapInvoiceRow(row);

    const items = await findInvoiceItems(invoice.invoice_id);

    invoices.push({
      ...invoice,
      items,
    });
  }

  return {
    invoices,
    total: countRows[0]?.total ?? 0,
  };
};

const insertInvoiceItems = async (
  connection: PoolConnection,
  invoiceId: number,
  items: InvoiceItemInput[],
): Promise<void> => {
  for (const item of items) {
    const lineTotal = item.quantity * item.unit_price;

    await connection.execute(
      `
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          line_total
        )

        VALUES (?, ?, ?, ?, ?)
      `,
      [invoiceId, item.description, item.quantity, item.unit_price, lineTotal],
    );
  }
};

export const createInvoice = async (
  adminId: number,
  input: CreateInvoiceInput,
): Promise<Invoice> => {
  const connection = await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    const { subtotal, totalAmount } = calculateTotals(
      input.items,
      input.discount_amount,
    );

    const [result] = await connection.execute<ResultSetHeader>(
      `
          INSERT INTO invoices (
            invoice_number,
            customer_id,
            appointment_id,
            car_id,
            created_by_admin_id,
            subtotal,
            discount_amount,
            total_amount,
            currency,
            payment_method,
            due_date,
            notes
          )

          VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `,
      [
        input.invoice_number,
        input.customer_id,
        input.appointment_id ?? null,
        input.car_id ?? null,
        adminId,
        subtotal,
        input.discount_amount,
        totalAmount,
        input.currency,
        input.payment_method ?? null,
        input.due_date ?? null,
        input.notes ?? null,
      ],
    );

    await insertInvoiceItems(connection, result.insertId, input.items);

    await connection.commit();

    const invoice = await findInvoiceById(result.insertId);

    if (!invoice) {
      throw new Error("The newly created invoice could not be retrieved.");
    }

    return invoice;
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateInvoice = async (
  invoiceId: number,
  input: UpdateInvoiceInput,
): Promise<Invoice> => {
  const existing = await findInvoiceById(invoiceId);

  if (!existing) {
    throw new Error("Invoice not found.");
  }

  const connection = await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    const items =
      input.items ??
      existing.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

    const discountAmount = input.discount_amount ?? existing.discount_amount;

    const { subtotal, totalAmount } = calculateTotals(items, discountAmount);

    const updates: string[] = [
      "subtotal = ?",
      "discount_amount = ?",
      "total_amount = ?",
    ];

    const values: Array<string | number | null> = [
      subtotal,
      discountAmount,
      totalAmount,
    ];

    const add = (column: string, value: string | number | null): void => {
      updates.push(`${column} = ?`);

      values.push(value);
    };

    if (input.appointment_id !== undefined) {
      add("appointment_id", input.appointment_id);
    }

    if (input.car_id !== undefined) {
      add("car_id", input.car_id);
    }

    if (input.currency !== undefined) {
      add("currency", input.currency);
    }

    if (input.payment_method !== undefined) {
      add("payment_method", input.payment_method);
    }

    if (input.due_date !== undefined) {
      add("due_date", input.due_date);
    }

    if (input.notes !== undefined) {
      add("notes", input.notes);
    }

    values.push(invoiceId);

    await connection.execute(
      `
        UPDATE invoices

        SET ${updates.join(", ")}

        WHERE invoice_id = ?
      `,
      values,
    );

    if (input.items !== undefined) {
      await connection.execute(
        `
          DELETE FROM invoice_items
          WHERE invoice_id = ?
        `,
        [invoiceId],
      );

      await insertInvoiceItems(connection, invoiceId, input.items);
    }

    await connection.commit();

    const updated = await findInvoiceById(invoiceId);

    if (!updated) {
      throw new Error("The updated invoice could not be retrieved.");
    }

    return updated;
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const recordInvoicePayment = async (
  invoiceId: number,
  amount: number,
  paymentMethod: string | null | undefined,
): Promise<Invoice | null> => {
  const invoice = await findInvoiceById(invoiceId);

  if (!invoice) {
    return null;
  }

  const newAmountPaid = invoice.amount_paid + amount;

  const cappedAmountPaid = Math.min(newAmountPaid, invoice.total_amount);

  let paymentStatus: "pending" | "partial" | "paid" = "pending";

  if (cappedAmountPaid >= invoice.total_amount) {
    paymentStatus = "paid";
  } else if (cappedAmountPaid > 0) {
    paymentStatus = "partial";
  }

  await databasePool.execute(
    `
        UPDATE invoices

        SET
          amount_paid = ?,
          payment_status = ?,
          payment_method =
            COALESCE(
              ?,
              payment_method
            )

        WHERE invoice_id = ?
      `,
    [cappedAmountPaid, paymentStatus, paymentMethod ?? null, invoiceId],
  );

  return findInvoiceById(invoiceId);
};
