import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Создать комментарий к задаче
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *               content:
 *                 type: string
 *                 example: "Это комментарий к задаче"
 *     responses:
 *       200:
 *         description: Комментарий успешно создан
 *       500:
 *         description: Ошибка при создании комментария
 */
router.post("/", auth, async (req, res) => {
  const { task_id, user_id, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [task_id, user_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при создании комментария" });
  }
});

/**
 * @openapi
 * /comments:
 *   get:
 *     summary: Получить комментарии для задачи
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: task_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Список комментариев
 *       500:
 *         description: Ошибка при получении комментариев
 */
router.get("/", auth, async (req, res) => {
  const { task_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM comments WHERE task_id = $1",
      [task_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при получении комментариев" });
  }
});

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     summary: Удалить комментарий по ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий успешно удалён
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка при удалении комментария
 */
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Комментарий не найден" });
    }
    res.json({ message: "Комментарий удалён", comment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении комментария" });
  }
});

export default router;
