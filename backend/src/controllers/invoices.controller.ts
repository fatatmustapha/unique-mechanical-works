import { Request, Response } from "express";
import { pool } from "../config/db";

// GET /api/invoices/mine — a customer's own invoices/transaction history, for their dashboard.
export async function getMyInvoices(req: Request, res: Response) {
  const [rows] = await pool.query(
    "SELECT * FROM invoices WHERE customer_id = ? ORDER BY issued_date DESC",
    [req.user!.id]
  );
  res.json(rows);
}

// GET /api/invoices — admin only. Full transaction list.
export async function getAllInvoices(_req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM invoices ORDER BY issued_date DESC");
  res.json(rows);
}

// POST /api/invoices — admin only. Creates an invoice tied to a car
// purchase, service, or appointment (related_type + related_id).
export async function createInvoice(req: Request, res: Response) {
  const { customer_id, related_type, related_id, amount, payment_method } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO invoices (customer_id, related_type, related_id, amount, payment_method) VALUES (?, ?, ?, ?, ?)",
    [customer_id, related_type, related_id, amount, payment_method]
  );
  res.status(201).json({ invoice_id: result.insertId });
}

// PUT /api/invoices/:id/status — admin only. Marks paid / partial / pending.
export async function updateInvoiceStatus(req: Request, res: Response) {
  const { payment_status } = req.body;
  await pool.query("UPDATE invoices SET payment_status = ? WHERE invoice_id = ?", [payment_status, req.params.id]);
  res.json({ message: "Invoice updated." });
}