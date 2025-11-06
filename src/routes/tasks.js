import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Создать новую задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Моя новая задача"
 *               description:
 *                 type: string
 *                 example: "Сделать проект до понедельника"
 *     responses:
 *       200:
 *         description: Задача успешно создана
 *       500:
 *         description: Ошибка при создании задачи
 */
router.post("/", auth, async (req, res) => {
  const { user_id, title, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [user_id, title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при создании задачи" });
  }
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Получить список всех задач
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список задач
 *       500:
 *         description: Ошибка при получении задач
 */
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении задач" });
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Получить задачу по ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Задача найдена
 *       404:
 *         description: Задача не найдена
 *       500:
 *         description: Ошибка при получении задачи
 */
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении задачи" });
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Обновить задачу по ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Обновлённое название"
 *               description:
 *                 type: string
 *                 example: "Новое описание задачи"
 *               status:
 *                 type: string
 *                 example: "in progress"
 *     responses:
 *       200:
 *         description: Задача успешно обновлена
 *       404:
 *         description: Задача не найдена
 *       500:
 *         description: Ошибка при обновлении задачи
 */
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 RETURNING *",
      [title, description, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при обновлении задачи" });
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Удалить задачу по ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Задача успешно удалена
 *       404:
 *         description: Задача не найдена
 *       500:
 *         description: Ошибка при удалении задачи
 */
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    res.json({ message: "Задача удалена", task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении задачи" });
  }
});

export default router;
