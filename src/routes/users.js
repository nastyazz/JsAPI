import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
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
 *         description: Пользователь успешно создан
 *       500:
 *         description: Ошибка при создании пользователя
 */
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при создании пользователя" });
  }
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *       500:
 *         description: Ошибка при получении пользователей
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении пользователей" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка при получении пользователя
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении пользователя" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка при удалении пользователя
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({ message: "Пользователь удалён", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении пользователя" });
  }
});

export default router;
