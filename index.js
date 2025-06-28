import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Test DB connection
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ DB connected successfully!");
    console.log("Current time:", result.rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1); // Stop the app if DB fails
  }
})();

app.get("/", (req, res) => {
  // TODO: Add homepage functionality
  res.send("Root Route Placeholder!");
});

app.get("/cars", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM cars");
    res.status(200).json(result.rows);
  } catch (err) {
    console.log("Error Fetching Cars:", err.message);
    res.status(500).json({ error: "Failed To Fetch Cars!" });
  } finally {
    client.release();
  }
});

app.post("/sell-car", async (req, res) => {
  //TODO: Add more fields & validations
  const { name } = req.body;
  const client = await pool.connect();

  if (!name) {
    return res.status(400).json({ error: "Name Is Required!" });
  }

  try {
    const result = await client.query(
      "INSERT INTO cars (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("Error Adding a New Car:", err.message);
    res.status(500).json({ error: "Failed To Add a New Car!" });
  } finally {
    client.release();
  }
});

app.get("/cars/:id", async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM cars WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car Not Found!" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(`Error Fetching Car With ID ${id}:`, err.message);
    res.status(500).json({ error: "Failed To Get Car Details!" });
  } finally {
    client.release();
  }
});

app.delete("/cars/:id", async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      "DELETE FROM cars WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Car Not Found!` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(`Error Deleting Car With ID ${id}:`, err.message);
    res.status(500).json({ error: "Failed To Delete Car!" });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
