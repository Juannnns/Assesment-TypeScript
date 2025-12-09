import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "helpdesk",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connection established successfully.");
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    // Continue without database for demo purposes
  }
}

export default sequelize;
