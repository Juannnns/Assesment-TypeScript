import type { Express } from "express";
import { createServer, type Server } from "http";
import { User, Ticket, Comment } from "./models";
import { authenticate, generateToken, requireRole, type AuthRequest } from "./middleware/auth";
import { 
  sendTicketCreatedEmail, 
  sendTicketResponseEmail, 
  sendTicketClosedEmail 
} from "./services/emailService";
import { 
  insertUserSchema, 
  loginSchema, 
  insertTicketSchema, 
  updateTicketSchema, 
  insertCommentSchema 
} from "../shared/schema";
import { Op } from "sequelize";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== AUTH ROUTES ====================

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error.errors[0].message 
        });
      }

      const { username, email, password, role, name } = validation.data;

      // Check if user exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: "User with this email or username already exists" 
        });
      }

      const user = await User.create({ username, email, password, role, name });
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, error: "Could not create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error.errors[0].message 
        });
      }

      const { email, password } = validation.data;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // ==================== TICKET ROUTES ====================

  // Get all tickets (agents only)
  app.get("/api/tickets", authenticate, requireRole("agent"), async (req: AuthRequest, res) => {
    try {
      const { status, priority } = req.query;
      
      const where: any = {};
      if (status && status !== "all") where.status = status;
      if (priority && priority !== "all") where.priority = priority;

      const tickets = await Ticket.findAll({
        where,
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
          { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
          { 
            model: Comment, 
            as: "comments",
            include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }]
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json({ success: true, data: tickets });
    } catch (error: any) {
      console.error("Get tickets error:", error);
      res.status(500).json({ success: false, error: "Could not fetch tickets" });
    }
  });

  // Get my tickets (clients)
  app.get("/api/tickets/my", authenticate, async (req: AuthRequest, res) => {
    try {
      const tickets = await Ticket.findAll({
        where: { createdById: req.user!.id },
        include: [
          { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
          { 
            model: Comment, 
            as: "comments",
            include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }]
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json({ success: true, data: tickets });
    } catch (error: any) {
      console.error("Get my tickets error:", error);
      res.status(500).json({ success: false, error: "Could not fetch tickets" });
    }
  });

  // Get single ticket
  app.get("/api/tickets/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.id, {
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
          { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        ],
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      // Clients can only view their own tickets
      if (req.user!.role === "client" && ticket.createdById !== req.user!.id) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      res.json({ success: true, data: ticket });
    } catch (error: any) {
      console.error("Get ticket error:", error);
      res.status(500).json({ success: false, error: "Could not fetch ticket" });
    }
  });

  // Create ticket (clients only)
  app.post("/api/tickets", authenticate, requireRole("client"), async (req: AuthRequest, res) => {
    try {
      const validation = insertTicketSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error.errors[0].message 
        });
      }

      const { title, description, priority } = validation.data;

      const ticket = await Ticket.create({
        title,
        description,
        priority,
        createdById: req.user!.id,
      });

      // Send email notification
      sendTicketCreatedEmail(
        req.user!.email,
        req.user!.name,
        ticket.id,
        ticket.title
      ).catch(console.error);

      // Fetch with associations
      const fullTicket = await Ticket.findByPk(ticket.id, {
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
          { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        ],
      });

      res.status(201).json({ success: true, data: fullTicket });
    } catch (error: any) {
      console.error("Create ticket error:", error);
      res.status(500).json({ success: false, error: "Could not create ticket" });
    }
  });

  // Update ticket (agents only for status/priority/assignment)
  app.patch("/api/tickets/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validation = updateTicketSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error.errors[0].message 
        });
      }

      const ticket = await Ticket.findByPk(req.params.id, {
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        ],
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      // Only agents can change status/priority/assignment
      const { status, priority, assignedToId } = validation.data;
      
      if ((status || priority || assignedToId !== undefined) && req.user!.role !== "agent") {
        return res.status(403).json({ 
          success: false, 
          error: "Only agents can modify status, priority, or assignment" 
        });
      }

      const wasOpen = ticket.status !== "closed";
      const previousStatus = ticket.status;
      
      await ticket.update(validation.data);

      // Send email if ticket was closed
      if (status === "closed" && wasOpen) {
        const createdBy = (ticket as any).createdBy;
        if (createdBy) {
          sendTicketClosedEmail(
            createdBy.email,
            createdBy.name,
            ticket.id,
            ticket.title
          ).catch(console.error);
        }
      }

      // Fetch updated ticket with associations
      const updatedTicket = await Ticket.findByPk(ticket.id, {
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
          { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
        ],
      });

      res.json({ success: true, data: updatedTicket });
    } catch (error: any) {
      console.error("Update ticket error:", error);
      res.status(500).json({ success: false, error: "Could not update ticket" });
    }
  });

  // Delete ticket (optional)
  app.delete("/api/tickets/:id", authenticate, requireRole("agent"), async (req: AuthRequest, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.id);

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      await Comment.destroy({ where: { ticketId: ticket.id } });
      await ticket.destroy();

      res.json({ success: true, message: "Ticket deleted" });
    } catch (error: any) {
      console.error("Delete ticket error:", error);
      res.status(500).json({ success: false, error: "Could not delete ticket" });
    }
  });

  // ==================== COMMENT ROUTES ====================

  // Get comments for a ticket
  app.get("/api/comments/:ticketId", authenticate, async (req: AuthRequest, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.ticketId);

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      // Clients can only view comments on their own tickets
      if (req.user!.role === "client" && ticket.createdById !== req.user!.id) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      const comments = await Comment.findAll({
        where: { ticketId: req.params.ticketId },
        include: [
          { model: User, as: "author", attributes: ["id", "name", "email", "role"] },
        ],
        order: [["createdAt", "ASC"]],
      });

      res.json({ success: true, data: comments });
    } catch (error: any) {
      console.error("Get comments error:", error);
      res.status(500).json({ success: false, error: "Could not fetch comments" });
    }
  });

  // Add comment to ticket
  app.post("/api/comments", authenticate, async (req: AuthRequest, res) => {
    try {
      const validation = insertCommentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error.errors[0].message 
        });
      }

      const { ticketId, message } = validation.data;

      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        ],
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found" });
      }

      // Clients can only comment on their own tickets
      if (req.user!.role === "client" && ticket.createdById !== req.user!.id) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      // Cannot comment on closed tickets
      if (ticket.status === "closed") {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot comment on closed tickets" 
        });
      }

      const comment = await Comment.create({
        ticketId,
        authorId: req.user!.id,
        message,
      });

      // If agent is responding, send email to client
      if (req.user!.role === "agent") {
        const createdBy = (ticket as any).createdBy;
        if (createdBy) {
          sendTicketResponseEmail(
            createdBy.email,
            createdBy.name,
            ticket.id,
            ticket.title,
            req.user!.name,
            message
          ).catch(console.error);
        }
      }

      // Fetch comment with author
      const fullComment = await Comment.findByPk(comment.id, {
        include: [
          { model: User, as: "author", attributes: ["id", "name", "email", "role"] },
        ],
      });

      res.status(201).json({ success: true, data: fullComment });
    } catch (error: any) {
      console.error("Create comment error:", error);
      res.status(500).json({ success: false, error: "Could not add comment" });
    }
  });

  // ==================== USER ROUTES ====================

  // Get all agents (for assignment dropdown)
  app.get("/api/users/agents", authenticate, requireRole("agent"), async (req: AuthRequest, res) => {
    try {
      const agents = await User.findAll({
        where: { role: "agent" },
        attributes: ["id", "name", "email", "username"],
      });

      res.json({ success: true, data: agents });
    } catch (error: any) {
      console.error("Get agents error:", error);
      res.status(500).json({ success: false, error: "Could not fetch agents" });
    }
  });

  return httpServer;
}
