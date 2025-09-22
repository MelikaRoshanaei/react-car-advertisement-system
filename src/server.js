import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool from "./config/db.js";
import carsRoutes from "./routes/carsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Test DB Connection
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ DB Connected Successfully!");
    console.log("Current Time:", result.rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1); // Stop the app if DB fails
  }
})();

// Routes
app.get("/", (req, res) => {
  res.send("Root Route Placeholder!");
});
app.use("/api/cars", carsRoutes);
app.use("/api/users", usersRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

export default app;
