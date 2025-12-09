import { DataTypes } from 'sequelize';


const UserModelAttributes = {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
  },
};

export default UserModelAttributes;