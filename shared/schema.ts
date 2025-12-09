import { z } from "zod";

// User roles
export type UserRole = "client" | "agent";

// Ticket status
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

// Ticket priority
export type TicketPriority = "low" | "medium" | "high";

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  createdBy?: User;
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
}

// Comment interface
export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  author?: User;
  message: string;
  createdAt: Date;
}

// Insert schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "agent"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedToId: z.string().nullable().optional(),
});

export const insertCommentSchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, "Comment cannot be empty"),
});

// Types for insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Auth response type
export interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
