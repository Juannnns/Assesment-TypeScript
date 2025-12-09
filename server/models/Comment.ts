import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface CommentAttributes {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  createdAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, "id" | "createdAt"> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: string;
  public ticketId!: string;
  public authorId!: string;
  public message!: string;
  public readonly createdAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "comments",
    timestamps: true,
    updatedAt: false,
  }
);

export default Comment;
