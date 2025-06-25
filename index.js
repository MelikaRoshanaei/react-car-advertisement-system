import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

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

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
