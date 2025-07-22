import pool from "../config/db.js";

export const getAllCars = async (req, res, next) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT * FROM cars");

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const getCarById = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    const result = await client.query("SELECT * FROM cars WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Car Not Found!" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const createCar = async (req, res, next) => {
  let client;
  try {
    const {
      name,
      brand,
      model,
      color,
      year,
      mileage,
      price,
      description,
      status,
    } = req.body;
    const user_id = req.user.id;
    client = await pool.connect();

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
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const updateCar = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    const { queryFields, values } = req.validatedData;
    client = await pool.connect();

    const check = await client.query("SELECT user_id FROM cars WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Car Not Found!" });
    }

    if (check.rows[0].user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query(
      `UPDATE cars SET ${queryFields.join(", ")} WHERE id = $${
        values.length + 1
      } RETURNING *`,
      [...values, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const deleteCar = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    const check = await client.query("SELECT user_id FROM cars WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Car Not Found!" });
    }

    if (check.rows[0].user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query(
      "DELETE FROM cars WHERE id = $1 RETURNING *",
      [id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const searchCars = async (req, res, next) => {
  let client;
  try {
    const { queryFields, values, sort, order } = req.validatedData;
    client = await pool.connect();

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
    next(err);
  } finally {
    if (client) client.release();
  }
};
