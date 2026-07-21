import { Request, Response } from "express";
import { pool } from "../config/db";

// GET /api/testimonials — public. Only approved reviews, for the
// Home/About trust-building section.
export async function getApprovedTestimonials(_req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM testimonials WHERE approved = 1 ORDER BY created_at DESC");
  res.json(rows);
}

// POST /api/testimonials — a logged-in customer leaves a review.
// Starts unapproved until an admin checks it, to keep spam off the public site.
export async function createTestimonial(req: Request, res: Response) {
  const { branch_id, rating, comment } = req.body;
  const [result]: any = await pool.query(
    "INSERT INTO testimonials (customer_id, branch_id, rating, comment) VALUES (?, ?, ?, ?)",
    [req.user!.id, branch_id ?? null, rating, comment]
  );
  res.status(201).json({ testimonial_id: result.insertId });
}

// GET /api/testimonials/admin — admin only. Includes unapproved ones.
export async function getAllTestimonials(_req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY created_at DESC");
  res.json(rows);
}

// PUT /api/testimonials/:id/approve — admin only.
export async function approveTestimonial(req: Request, res: Response) {
  await pool.query("UPDATE testimonials SET approved = 1 WHERE testimonial_id = ?", [req.params.id]);
  res.json({ message: "Testimonial approved." });
}

// DELETE /api/testimonials/:id — admin only. Rejects/removes a review.
export async function deleteTestimonial(req: Request, res: Response) {
  await pool.query("DELETE FROM testimonials WHERE testimonial_id = ?", [req.params.id]);
  res.json({ message: "Testimonial removed." });
}