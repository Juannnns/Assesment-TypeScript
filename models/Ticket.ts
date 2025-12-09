import { DataTypes } from 'sequelize';

export const TicketFields = {
  createdById: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  assignedToId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
};