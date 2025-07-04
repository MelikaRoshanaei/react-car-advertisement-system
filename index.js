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
  // Note: replaced "const" keyword with "let" to allow reassignment (e.g. status)
  let {
    name,
    brand,
    model,
    color,
    year,
    mileage,
    price,
    description,
    user_id,
    status,
  } = req.body;

  // Note: validations ensure that the car name is a non-empty real string, trimmed of white space, not just number like "123" and under 100 characters
  if (
    typeof name !== "string" ||
    !(name = name.trim()) ||
    name.length > 100 ||
    /^\d+$/.test(name)
  ) {
    return res.status(400).json({
      error:
        "Valid Car Name Is Required! (under 100 characters and not only numbers) ",
    });
  }

  // Validate Brand
  if (
    typeof brand !== "string" ||
    !(brand = brand.trim()) ||
    brand.length > 50 ||
    /^\d+$/.test(brand)
  ) {
    return res.status(400).json({
      error:
        "Valid Brand Is Required (under 50 characters and not only numbers)",
    });
  }

  // Validate Model
  if (
    typeof model !== "string" ||
    !(model = model.trim()) ||
    model.length > 50 ||
    /^\d+$/.test(model)
  ) {
    return res.status(400).json({
      error:
        "Valid Model Is Required (under 50 characters and not only numbers)",
    });
  }

  // Validate Color
  if (
    typeof color !== "string" ||
    !(color = color.trim()) ||
    color.length > 30 ||
    /^\d+$/.test(color)
  ) {
    return res.status(400).json({
      error: "Valid Color Is Required (under 30 characters and not numbers)",
    });
  }

  // Validate Year
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > new Date().getFullYear()
  ) {
    return res.status(400).json({ error: "Valid Year Is Required!" });
  }

  // Validate Mileage
  if (typeof mileage !== "number" || mileage < 0) {
    return res.status(400).json({ error: "Valid Mileage Is Required!" });
  }

  // Validate Price
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "Valid Price Is Required!" });
  }

  // Validate Description (Optional)
  if (description && typeof description === "string") {
    description = description.trim();
    if (description.length > 1000) {
      return res.status(400).json({
        error: "Description Is Too Long! (must be under 1000 characters)",
      });
    }
  }

  // Note: if user_id doesn't refer to an existing user, postgreSQL will throw a foreign key constraint error!
  if (
    typeof user_id !== "number" ||
    !Number.isInteger(user_id) ||
    user_id <= 0
  ) {
    return res.status(400).json({ error: "Valid User ID Is Required!" });
  }

  const allowedStatuses = ["active", "sold", "archived"];
  // Note: if status is missing or invalid, default to 'pending'
  if (
    typeof status !== "string" ||
    status.trim() === "" ||
    !allowedStatuses.includes(status.trim())
  ) {
    status = "pending";
  } else {
    status = status.trim();
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      "INSERT INTO cars (name, brand, model, color, year, mileage, price, description, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        name,
        brand,
        model,
        color,
        year,
        mileage,
        price,
        description,
        user_id,
        status,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("Error Adding a New Car:", err.message);
    res.status(500).json({ error: "Failed To Add a New Car!" });
  } finally {
    client.release();
  }
});

app.get("/cars/search", async (req, res) => {
  //TODO: Add more fields & update the logic
  const { name } = req.query;
  const client = await pool.connect();

  if (!name) {
    return res.status(400).json({ error: "Name Is Required!" });
  }

  try {
    const result = await client.query(
      "SELECT * FROM cars WHERE name ILIKE $1",
      [`%${name}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No Existing Match Found!" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.log("Something Went Wrong:", err.message);
    res.status(500).json({ error: "The Operation Failed!" });
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
      return res.status(404).json({ error: "Car Not Found!" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(`Error Deleting Car With ID ${id}:`, err.message);
    res.status(500).json({ error: "Failed To Delete Car!" });
  } finally {
    client.release();
  }
});

app.patch("/cars/:id", async (req, res) => {
  const id = req.params.id;
  //TODO: Add more fields & update the logic
  const { name } = req.body;
  const client = await pool.connect();

  if (!name) {
    return res.status(400).json({ error: "Name Is Required!" });
  }

  try {
    const result = await client.query(
      "UPDATE cars SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car Not Found!" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log("Error Updating Car Details:", err.message);
    res.status(500).json({ error: "Failed To Update Car Details!" });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
