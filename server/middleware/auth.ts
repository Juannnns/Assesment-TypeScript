import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "helpdesk-secret-key";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: "client" | "agent";
    name: string;
  };
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
}

export function requireRole(...roles: ("client" | "agent")[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
