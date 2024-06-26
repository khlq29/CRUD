import express from "express";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database(":memory:"); // Create an in-memory database
//with database
// Initialize the database schema
db.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT
  )
`);

// Get the list of users from the database
router.get("/", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.send(users);
});

// Add a user to the database
router.post("/", (req, res) => {
  const user = { ...req.body, id: uuidv4() };
  const stmt = db.prepare(
    "INSERT INTO users (id, first_name, last_name, email) VALUES (?, ?, ?, ?)"
  );
  stmt.run(user.id, user.first_name, user.last_name, user.email);
  res.send(`${user.first_name} has been added to the database`);
});

// Get a particular user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send("User not found");
  }
});

// Delete a user from the database
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id);
  res.send(`${id} deleted successfully from the database`);
});

// Update a user in the database
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const updatedUser = {
    first_name: first_name || user.first_name,
    last_name: last_name || user.last_name,
    email: email || user.email,
  };

  const stmt = db.prepare(
    "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?"
  );
  stmt.run(
    updatedUser.first_name,
    updatedUser.last_name,
    updatedUser.email,
    id
  );

  res.send(`User with the id ${id} has been updated`);
});

export default router;
