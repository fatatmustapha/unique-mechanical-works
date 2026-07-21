import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

// POST /api/auth/register — creates a customer account.
// The password is hashed before saving; the database never sees it in plain text.
export async function registerCustomer(req: Request, res: Response) {
  const { first_name, last_name, email, phone, password, preferred_branch } = req.body;

  const [existing]: any = await pool.query("SELECT customer_id FROM customers WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [result]: any = await pool.query(
    "INSERT INTO customers (first_name, last_name, email, phone, password_hash, preferred_branch) VALUES (?, ?, ?, ?, ?, ?)",
    [first_name, last_name, email, phone ?? null, password_hash, preferred_branch ?? null]
  );

  const token = jwt.sign({ id: result.insertId, role: "customer" }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.status(201).json({ token, customer_id: result.insertId });
}

// POST /api/auth/login — customer login. Compares the submitted
// password against the stored hash and issues a token on success.
export async function loginCustomer(req: Request, res: Response) {
  const { email, password } = req.body;

  const [rows]: any = await pool.query("SELECT * FROM customers WHERE email = ?", [email]);
  const customer = rows[0];
  if (!customer || !(await bcrypt.compare(password, customer.password_hash))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  const token = jwt.sign({ id: customer.customer_id, role: "customer" }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.json({
    token,
    customer: { id: customer.customer_id, first_name: customer.first_name, last_name: customer.last_name, email: customer.email },
  });
}

// POST /api/auth/admin/login — separate admin login. This route is
// never linked from the public nav, only used by the admin dashboard's login screen.
export async function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;

  const [rows]: any = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  const token = jwt.sign({ id: admin.admin_id, role: "admin" }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.json({ token, admin: { id: admin.admin_id, first_name: admin.first_name, last_name: admin.last_name, role: admin.role } });
}

// GET /api/auth/me — returns whoever the current token belongs to.
// Called on page load to check "am I still logged in, and as what?".
export async function getCurrentUser(req: Request, res: Response) {
  const { id, role } = req.user!;
  const table = role === "admin" ? "admins" : "customers";
  const idCol = role === "admin" ? "admin_id" : "customer_id";

  const [rows]: any = await pool.query(`SELECT * FROM ${table} WHERE ${idCol} = ?`, [id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ message: "Account not found." });

  delete user.password_hash;
  res.json({ role, user });
}