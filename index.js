import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

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
      error: "Valid Car Name Is Required!",
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
      error: "Valid Brand Is Required!",
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
      error: "Valid Model Is Required!",
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
      error: "Valid Color Is Required!",
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

  // Validate Description (if provided)
  if (description !== undefined && description !== null) {
    if (typeof description === "string") {
      description = description.trim();
      if (description === "") {
        description = null;
      } else if (description.length > 1000) {
        return res.status(400).json({
          error: "Description Is Too Long!",
        });
      }
    } else {
      return res.status(400).json({ error: "Invalid Description Type!" });
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
  let {
    name,
    brand,
    model,
    color,
    year,
    minYear,
    maxYear,
    price,
    minPrice,
    maxPrice,
    mileage,
    minMileage,
    maxMileage,
    status,
    sort,
    order,
  } = req.query;

  let orderIndex = 1;
  let queryFields = [];
  let values = [];

  // Validate Name (if provided)
  if (name !== undefined) {
    if (
      !(name = name.trim()) ||
      name === "" ||
      name.length > 100 ||
      !/[a-zA-Z]/.test(name)
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Car Name!" });
    }
    queryFields.push(`name ILIKE $${orderIndex}`);
    values.push(`%${name}%`);
    orderIndex++;
  }

  // Validate Brand (if provided)
  if (brand !== undefined) {
    if (
      !(brand = brand.trim()) ||
      brand === "" ||
      brand.length > 50 ||
      !/[a-zA-Z]/.test(brand)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Brand!" });
    }
    queryFields.push(`brand ILIKE $${orderIndex}`);
    values.push(`%${brand}%`);
    orderIndex++;
  }

  // Validate Model (if provided)
  if (model !== undefined) {
    if (
      !(model = model.trim()) ||
      model === "" ||
      model.length > 50 ||
      !/[a-zA-Z]/.test(model)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Model!" });
    }
    queryFields.push(`model ILIKE $${orderIndex}`);
    values.push(`%${model}%`);
    orderIndex++;
  }

  // Validate Color (if provided)
  if (color !== undefined) {
    if (
      !(color = color.trim()) ||
      color === "" ||
      color.length > 30 ||
      !/[a-zA-Z]/.test(color)
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Color!" });
    }
    queryFields.push(`color ILIKE $${orderIndex}`);
    values.push(`%${color}%`);
    orderIndex++;
  }

  // Validate Year (if provided)
  if (year !== undefined) {
    year = Number(year);
    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Year!" });
    }
    queryFields.push(`year = $${orderIndex}`);
    values.push(year);
    orderIndex++;
  }

  // Validate Min-Year (if provided)
  if (minYear !== undefined) {
    minYear = Number(minYear);
    if (
      !Number.isInteger(minYear) ||
      minYear < 1900 ||
      minYear > new Date().getFullYear()
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Year!" });
    }
    queryFields.push(`year >= $${orderIndex}`);
    values.push(minYear);
    orderIndex++;
  }

  // Validate Max-Year (if provided)
  if (maxYear !== undefined) {
    maxYear = Number(maxYear);
    if (
      !Number.isInteger(maxYear) ||
      maxYear < 1900 ||
      maxYear > new Date().getFullYear()
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Year!" });
    }
    queryFields.push(`year <= $${orderIndex}`);
    values.push(maxYear);
    orderIndex++;
  }

  // Validate Price (if provide)
  if (price !== undefined) {
    price = Number(price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Please Provide a Valid Price!" });
    }
    queryFields.push(`price = $${orderIndex}`);
    values.push(price);
    orderIndex++;
  }

  // Validate Min-Price (if provided)
  if (minPrice !== undefined) {
    minPrice = Number(minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Price!" });
    }
    queryFields.push(`price >= $${orderIndex}`);
    values.push(minPrice);
    orderIndex++;
  }

  // Validate Max-Price (if provided)
  if (maxPrice !== undefined) {
    maxPrice = Number(maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Price!" });
    }
    queryFields.push(`price <= $${orderIndex}`);
    values.push(maxPrice);
    orderIndex++;
  }

  // Validate Mileage (if provided)
  if (mileage !== undefined) {
    mileage = mileage.trim();
    if (
      mileage === "" ||
      isNaN(mileage) ||
      !Number.isInteger(Number(mileage)) ||
      Number(mileage) < 0
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Mileage!" });
    }
    mileage = Number(mileage);
    queryFields.push(`mileage = $${orderIndex}`);
    values.push(mileage);
    orderIndex++;
  }

  // Validate Min-Mileage (if provided)
  if (minMileage !== undefined) {
    minMileage = minMileage.trim();
    if (
      minMileage === "" ||
      isNaN(minMileage) ||
      !Number.isInteger(Number(minMileage)) ||
      Number(minMileage) < 0
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Min-Mileage!" });
    }
    minMileage = Number(minMileage);
    queryFields.push(`mileage >= $${orderIndex}`);
    values.push(minMileage);
    orderIndex++;
  }

  // Validate Max-Mileage (if provided)
  if (maxMileage !== undefined) {
    maxMileage = maxMileage.trim();
    if (
      maxMileage === "" ||
      isNaN(maxMileage) ||
      !Number.isInteger(Number(maxMileage)) ||
      Number(maxMileage) < 0
    ) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Max-Mileage!" });
    }
    maxMileage = Number(maxMileage);
    queryFields.push(`mileage <= $${orderIndex}`);
    values.push(maxMileage);
    orderIndex++;
  }

  // Validate Status (if provided)
  const allowedStatuses = ["active", "sold", "archived", "pending"];
  if (status !== undefined) {
    status = status.trim().toLowerCase();
    if (status === "" || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Please Provide a Valid Status!" });
    }
    queryFields.push(`status = $${orderIndex}`);
    values.push(status);
    orderIndex++;
  }

  // Validate Sort (if provided)
  const allowedSort = ["created_at", "year", "price", "mileage"];
  // Note: if sort is missing or invalid, default to 'created_at'
  if (sort !== undefined) {
    sort = sort.trim().toLowerCase();
    if (sort === "" || !allowedSort.includes(sort)) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Sort Type!" });
    }
  } else {
    sort = "created_at";
  }

  // Validate Order (if provided)
  const allowedOrder = ["ASC", "DESC"];
  // Note: if order is missing or invalid, default to 'ASC'
  if (order !== undefined) {
    order = order.trim().toUpperCase();
    if (order === "" || !allowedOrder.includes(order)) {
      return res
        .status(400)
        .json({ error: "Please Provide a Valid Order Type!" });
    }
  } else {
    order = "ASC";
  }

  // Note: if no valid field provided (everything undefined), stop early
  if (queryFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No Valid Field Provided For Search!" });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM cars ${
        queryFields.length ? `WHERE ${queryFields.join(" AND ")}` : ""
      } ORDER BY ${sort} ${order}`,
      values
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
  let { name, brand, model, color, year, mileage, price, description, status } =
    req.body;

  let orderIndex = 1;
  let queryFields = [];
  let values = [];

  // Validate Name (if provided)
  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      !(name = name.trim()) ||
      name.length > 100 ||
      /^\d+$/.test(name)
    ) {
      return res.status(400).json({
        error: "Please Provide a Valid Car Name!",
      });
    }
    queryFields.push(`name = $${orderIndex}`);
    values.push(name);
    orderIndex++;
  }

  // Validate Brand (if provided)
  if (brand !== undefined) {
    if (
      typeof brand !== "string" ||
      !(brand = brand.trim()) ||
      brand.length > 50 ||
      /^\d+$/.test(brand)
    ) {
      return res.status(400).json({
        error: "Please Provide a Valid Brand!",
      });
    }
    queryFields.push(`brand = $${orderIndex}`);
    values.push(brand);
    orderIndex++;
  }

  // Validate Model (if provided)
  if (model !== undefined) {
    if (
      typeof model !== "string" ||
      !(model = model.trim()) ||
      model.length > 50 ||
      /^\d+$/.test(model)
    ) {
      return res.status(400).json({
        error: "Please Provide a Valid Model!",
      });
    }
    queryFields.push(`model = $${orderIndex}`);
    values.push(model);
    orderIndex++;
  }

  // Validate Color (if provided)
  if (color !== undefined) {
    if (
      typeof color !== "string" ||
      !(color = color.trim()) ||
      color.length > 30 ||
      /^\d+$/.test(color)
    ) {
      return res.status(400).json({
        error: "Please Provide a Valid Color!",
      });
    }
    queryFields.push(`color = $${orderIndex}`);
    values.push(color);
    orderIndex++;
  }

  // Validate Year (if provided)
  if (year !== undefined) {
    if (
      typeof year !== "number" ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Year!" });
    }
    queryFields.push(`year = $${orderIndex}`);
    values.push(year);
    orderIndex++;
  }

  // Validate Mileage (if provided)
  if (mileage !== undefined) {
    if (typeof mileage !== "number" || mileage < 0) {
      return res.status(400).json({ error: "Please Provide a Valid Mileage!" });
    }
    queryFields.push(`mileage = $${orderIndex}`);
    values.push(mileage);
    orderIndex++;
  }

  // Validate Price (if provided)
  if (price !== undefined) {
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "Please Provide a Valid Price!" });
    }
    queryFields.push(`price = $${orderIndex}`);
    values.push(price);
    orderIndex++;
  }

  // Validate Description (if provided)
  if (description !== undefined) {
    if (typeof description === "string") {
      description = description.trim();
      if (description === "") {
        description = null;
      } else if (description.length > 1000) {
        return res.status(400).json({
          error: "Description Is Too Long!",
        });
      }
    } else {
      return res.status(400).json({ error: "Invalid Description Type!" });
    }
    queryFields.push(`description = $${orderIndex}`);
    values.push(description);
    orderIndex++;
  }

  // Validate Status (if provided)
  const allowedStatuses = ["active", "sold", "archived"];
  // Note: if status is missing or invalid, throw an error and not overwrite 'pending'
  if (status !== undefined) {
    if (
      typeof status !== "string" ||
      status.trim() === "" ||
      !allowedStatuses.includes(status.trim())
    ) {
      return res.status(400).json({ error: "Please Provide a Valid Status!" });
    }
    status = status.trim();
    queryFields.push(`status = $${orderIndex}`);
    values.push(status);
    orderIndex++;
  }

  // Note: if no valid field provided (everything undefined), stop early
  if (queryFields.length === 0) {
    return res
      .status(400)
      .json({ error: "No Valid Field Provided For Update!" });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE cars SET ${queryFields.join(
        ", "
      )} WHERE id = $${orderIndex} RETURNING *`,
      [...values, id]
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

app.post("/users/register", async (req, res) => {
  const { name, email, password, phone_number } = req.body;
  let role = "user";

  // Validate Name
  if (
    typeof name !== "string" ||
    name !== name.trim() ||
    name.length < 3 ||
    name.length > 100 ||
    !/^[a-zA-Z\s]{3,100}$/.test(name)
  ) {
    return res.status(400).json({ error: "Valid User Name Is Requires!" });
  }

  // Validate Email Address
  if (
    typeof email !== "string" ||
    email !== email.trim() ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    return res.status(400).json({ error: "Valid Email Address Is Required!" });
  }

  // Validate Password
  if (
    typeof password !== "string" ||
    password !== password.trim() ||
    password.length < 8 ||
    password.length > 64 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/.test(password)
  ) {
    return res.status(400).json({ error: "Valid Password Is Required!" });
  }

  // Validate Phone Number
  if (
    typeof phone_number !== "string" ||
    phone_number !== phone_number.trim() ||
    phone_number.length > 15 ||
    !/^(0|\+98)9\d{9}$/.test(phone_number)
  ) {
    return res.status(400).json({ error: "Valid Phone Number Is Required!" });
  }

  const client = await pool.connect();

  try {
    // Handling Email Duplication
    const existingEmail = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User With This Email Address Already Exists!" });
    }

    // Handling Phone Number Duplication
    const existingPhoneNumber = await client.query(
      "SELECT * FROM users WHERE phone_number = $1",
      [phone_number]
    );

    if (existingPhoneNumber.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User With This Phone Number Already Exists!" });
    }

    const result = await client.query(
      "INSERT INTO users (name, email, password, phone_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, password, phone_number, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("Erorr Registering User:", err.message);
    res.status(500).json({ error: "Failed To Register User!" });
  } finally {
    client.release();
  }
});

app.get("/users", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (err) {
    console.log("Error Fetching Users:", err.message);
    res.status(500).json({ error: "Failed To Fetch Users!" });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
