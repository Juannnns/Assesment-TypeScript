import api from "./axios";
import type {
  User,
  Ticket,
  Comment,
  LoginCredentials,
  InsertUser,
  InsertTicket,
  UpdateTicket,
  InsertComment,
  AuthResponse,
  ApiResponse,
} from "@shared/schema";

// Auth services
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
    if (response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data.data!;
  },

  async register(userData: InsertUser): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", userData);
    if (response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data.data!;
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser(): Omit<User, "password"> | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};

// Ticket services
export const ticketService = {
  async getAll(filters?: { status?: string; priority?: string }): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    const response = await api.get<ApiResponse<Ticket[]>>(`/tickets?${params.toString()}`);
    return response.data.data || [];
  },

  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get<ApiResponse<Ticket[]>>("/tickets/my");
    return response.data.data || [];
  },

  async getById(id: string): Promise<Ticket> {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data!;
  },

  async create(ticket: InsertTicket): Promise<Ticket> {
    const response = await api.post<ApiResponse<Ticket>>("/tickets", ticket);
    return response.data.data!;
  },

  async update(id: string, data: UpdateTicket): Promise<Ticket> {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  async close(id: string): Promise<Ticket> {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, { status: "closed" });
    return response.data.data!;
  },
};

// Comment services
export const commentService = {
  async getByTicketId(ticketId: string): Promise<Comment[]> {
    const response = await api.get<ApiResponse<Comment[]>>(`/comments/${ticketId}`);
    return response.data.data || [];
  },

  async create(data: InsertComment): Promise<Comment> {
    const response = await api.post<ApiResponse<Comment>>("/comments", data);
    return response.data.data!;
  },
};

// User services (for agents)
export const userService = {
  async getAgents(): Promise<Omit<User, "password">[]> {
    const response = await api.get<ApiResponse<Omit<User, "password">[]>>("/users/agents");
    return response.data.data || [];
  },
};
