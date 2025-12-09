import dotenv from "dotenv";
dotenv.config();
import { Sequelize, QueryTypes } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export async function initDatabase() {
  try {
    console.log("🔄 Attempting to connect to the database...");
    await sequelize.authenticate();
    console.log("✅ MySQL connection established successfully.");

    console.log("🔄 Cleaning up invalid data in the 'role' column...");
    await sequelize.query(
      "UPDATE users SET role = 'client' WHERE role NOT IN ('client', 'agent');",
      { type: QueryTypes.UPDATE }
    );
    console.log("✅ Invalid data in 'role' column cleaned up.");

    console.log("🔄 Ensuring 'id' column in 'users' table is set to CHAR(36) BINARY...");
    await sequelize.query("ALTER TABLE users MODIFY id CHAR(36) BINARY NOT NULL;");
    console.log("✅ 'id' column in 'users' table set to CHAR(36) BINARY.");

    console.log("🔄 Synchronizing database models...");
    await sequelize.sync({ alter: true, logging: console.log });
    console.log("✅ Database models synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

export default sequelize;