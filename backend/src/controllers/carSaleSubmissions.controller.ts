import { Request, Response } from "express";
import { pool } from "../config/db";

// POST /api/car-sale-submissions — a logged-in customer submits their
// own car for the admin team to review before it's listed for sale.
export async function createSubmission(req: Request, res: Response) {
  const { make, model, year, expected_price, description, image_urls } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO car_sale_submissions (customer_id, make, model, year, expected_price, description, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.user!.id, make, model, year, expected_price, description, image_urls]
  );
  res.status(201).json({ submission_id: result.insertId });
}

// GET /api/car-sale-submissions — admin only. ?status=pending to filter the inbox.
export async function getSubmissions(req: Request, res: Response) {
  const { status } = req.query;
  const sql = status
    ? "SELECT * FROM car_sale_submissions WHERE status = ? ORDER BY created_at DESC"
    : "SELECT * FROM car_sale_submissions ORDER BY created_at DESC";
  const [rows] = await pool.query(sql, status ? [status] : []);
  res.json(rows);
}

// PUT /api/car-sale-submissions/:id — admin only. Approve or reject.
// Approving here does NOT auto-create a live car listing — that's a
// deliberate manual step so the admin fills in the full spec sheet first.
export async function reviewSubmission(req: Request, res: Response) {
  const { status } = req.body; // "approved" | "rejected"
  await pool.query(
    "UPDATE car_sale_submissions SET status = ?, reviewed_by = ? WHERE submission_id = ?",
    [status, req.user!.id, req.params.id]
  );
  res.json({ message: `Submission ${status}.` });
}