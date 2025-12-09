import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TicketAttributes {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdById: string;
  assignedToId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TicketCreationAttributes extends Optional<TicketAttributes, "id" | "status" | "assignedToId" | "createdAt" | "updatedAt"> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: "open" | "in_progress" | "resolved" | "closed";
  public priority!: "low" | "medium" | "high";
  public createdById!: string;
  public assignedToId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tickets",
    timestamps: true,
  }
);

export default Ticket;
