import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               password:
 *                 type: string
 *                 example: myPassword123
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Пользователь уже существует
 *       500:
 *         description: Ошибка регистрации
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id, username",
      [username, hashedPassword]
    );

    res.status(201).json({ user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка регистрации" });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Вход пользователя и получение JWT токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               password:
 *                 type: string
 *                 example: myPassword123
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверный логин или пароль
 *       500:
 *         description: Ошибка входа
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка входа" });
  }
});

export default router;
