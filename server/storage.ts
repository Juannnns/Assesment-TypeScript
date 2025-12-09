// Storage interface - now using Sequelize with MySQL
// This file is kept for compatibility but the actual storage
// is handled by Sequelize models in server/models/

import { User, Ticket, Comment } from "./models";
import type { InsertUser } from "../shared/schema";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: InsertUser): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    return User.findByPk(id);
  }

  async getUserByUsername(username: string) {
    return User.findOne({ where: { username } });
  }

  async getUserByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async createUser(insertUser: InsertUser) {
    return User.create(insertUser);
  }
}

export const storage = new DatabaseStorage();
