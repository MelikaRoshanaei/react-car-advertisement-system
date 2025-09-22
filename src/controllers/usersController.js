import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

export const getAllUsers = async (req, res, next) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT * FROM users");

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const getUserById = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    if (Number(id) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User Not Found!" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const registerUser = async (req, res, next) => {
  let client;
  try {
    const { name, email, password, phone_number } = req.body;
    client = await pool.connect();

    const existingEmail = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User With This Email Address Already Exists!" });
    }

    const existingPhoneNumber = await client.query(
      "SELECT * FROM users WHERE phone_number = $1",
      [phone_number]
    );

    if (existingPhoneNumber.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User With This Phone Number Already Exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await client.query(
      "INSERT INTO users (name, email, password, phone_number, role) VALUES ($1, $2, $3, $4, 'user') RETURNING *",
      [name, email, hashedPassword, phone_number]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        role: result.rows[0].role,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const loginUser = async (req, res, next) => {
  let client;
  try {
    const { email, phone_number, password, loginMethod } = req.body;
    client = await pool.connect();

    if (loginMethod === "email") {
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User Not Found!" });
      }

      if (await bcrypt.compare(password, result.rows[0].password)) {
        const token = jwt.sign(
          { id: result.rows[0].id, role: result.rows[0].role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.status(200).json({
          token,
          user: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            role: result.rows[0].role,
          },
        });
      } else {
        return res.status(401).json({ error: "Invalid Credentials!" });
      }
    }

    if (loginMethod === "phone_number") {
      const result = await client.query(
        "SELECT * FROM users WHERE phone_number = $1",
        [phone_number]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User Not Found!" });
      }

      if (await bcrypt.compare(password, result.rows[0].password)) {
        const token = jwt.sign(
          { id: result.rows[0].id, role: result.rows[0].role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.status(200).json({
          token,
          user: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            role: result.rows[0].role,
          },
        });
      } else {
        return res.status(401).json({ error: "Invalid Credentials!" });
      }
    }
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const updateUser = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    const { queryFields, values } = req.validatedData;
    client = await pool.connect();

    const check = await client.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "User Not Found!" });
    }

    if (Number(id) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query(
      `UPDATE users SET ${queryFields.join(", ")} WHERE id = $${
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

export const deleteUser = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    const check = await client.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "User Not Found!" });
    }

    if (Number(id) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};

export const getUserCars = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    const existingUser = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: "User Not Found!" });
    }

    if (Number(id) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden!" });
    }

    const result = await client.query("SELECT * FROM cars WHERE user_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No Car Found For This User!" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  } finally {
    if (client) client.release();
  }
};
