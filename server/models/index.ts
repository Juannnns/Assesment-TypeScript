import User from "./User";
import Ticket from "./Ticket";
import Comment from "./Comment";

// Define associations
User.hasMany(Ticket, { foreignKey: "createdById", as: "createdTickets" });
Ticket.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

User.hasMany(Ticket, { foreignKey: "assignedToId", as: "assignedTickets" });
Ticket.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });

Ticket.hasMany(Comment, { foreignKey: "ticketId", as: "comments" });
Comment.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });

User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

export { User, Ticket, Comment };
