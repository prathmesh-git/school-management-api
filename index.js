const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

const schoolRoutes = require("./routes/schools");

let dbConfig;

if (process.env.DB_MODE === "local") {
  dbConfig = {
    host: process.env.DB_LOCAL_HOST,
    port: process.env.DB_LOCAL_PORT,
    user: process.env.DB_LOCAL_USER,
    password: process.env.DB_LOCAL_PASSWORD,
    database: process.env.DB_LOCAL_NAME,
  };
} else if (process.env.DB_MODE === "tidb") {
  dbConfig = {
    host: process.env.DB_TIDB_HOST,
    port: process.env.DB_TIDB_PORT,
    user: process.env.DB_TIDB_USER,
    password: process.env.DB_TIDB_PASSWORD,
    database: process.env.DB_TIDB_NAME,
    ssl: { rejectUnauthorized: true },
  };
} else {
  throw new Error("Invalid DB_MODE in .env. Use 'local' or 'tidb'.");
}

const connection = mysql.createConnection(dbConfig);

const app = express();
app.use(bodyParser.json());

// Connect to DB and start server only if connection is successful
connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  } else {
    console.log(`✅ Connected to ${process.env.DB_MODE} database`);

    // Make connection available in req object (optional, if you want)
    app.use((req, res, next) => {
      req.db = connection;
      next();
    });

    // Routes
    app.use("/", schoolRoutes);

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  }
});
