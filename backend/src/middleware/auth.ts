import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Shape of the data stored inside every token we issue.
export interface AuthPayload {
  id: number;
  role: "customer" | "admin";
}

// Lets every route file use req.user with proper typing.
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Reads "Authorization: Bearer <token>", verifies it, and attaches
// the decoded { id, role } to req.user. Any route that needs a
// logged-in user (customer OR admin) uses this first.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "You need to be logged in to do that." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Log in again." });
  }
}

// Runs after requireAuth. Blocks the request unless the logged-in
// user is an admin. Put this on every admin-only route.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
}