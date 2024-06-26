import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users.js";
import Database from "better-sqlite3";

const app = express();
const PORT = 5000;

const db = new Database(":memory:"); // Create an in-memory database

// Initialize the database schema
db.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT
  )
`);

app.use(bodyParser.json());

app.use(
  "/users",
  (req, res, next) => {
    req.db = db; // Attach the database to the request object
    next();
  },
  userRoutes
);

app.get("/", (req, res) => res.send("HELLO FROM HOMEPAGE"));

app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);

// Graceful shutdown
process.on("SIGINT", () => {
  db.close();
  console.log("Database connection closed");
  process.exit();
});
