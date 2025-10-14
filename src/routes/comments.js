import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

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
