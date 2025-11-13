import request from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("Comments API", () => {
  let token;
  let taskId;
  let commentId;
  let userId;

  beforeAll(async () => {
    await pool.query("DELETE FROM comments");
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM users");

    const userRes = await request(app)
      .post("/auth/register")
      .send({ username: "commentuser", password: "123456" });
    userId = userRes.body.user.id;

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ username: "commentuser", password: "123456" });
    token = loginRes.body.token;

    const taskRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, title: "Task for comments", description: "desc" });
    taskId = taskRes.body.id;
  });

  test("POST /comments — создать комментарий", async () => {
    const res = await request(app)
      .post("/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ task_id: taskId, user_id: userId, content: "My comment" });

    expect(res.statusCode).toBe(200);
    commentId = res.body.id;
  });

  test("GET /comments?task_id= — получить комментарии к задаче", async () => {
    const res = await request(app)
      .get(`/comments?task_id=${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("DELETE /comments/:id — удалить комментарий", async () => {
    const res = await request(app)
      .delete(`/comments/${commentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Комментарий удалён");
  });
});

afterAll(async () => {
    await pool.end();
  });
  
