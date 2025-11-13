import request from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("Tasks API", () => {
  let token;
  let taskId;
  let userId;

  beforeAll(async () => {
    await pool.query("DELETE FROM comments");
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM users");

    const userRes = await request(app)
      .post("/auth/register")
      .send({ username: "taskuser", password: "123456" });
    userId = userRes.body.user.id;

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ username: "taskuser", password: "123456" });
    token = loginRes.body.token;
  });

  test("POST /tasks — создать задачу", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, title: "Test Task", description: "Desc" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Task");
    taskId = res.body.id;
  });

  test("GET /tasks — получить все задачи", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /tasks/:id — получить задачу по ID", async () => {
    const res = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Task");
  });

  test("PUT /tasks/:id — обновить задачу", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task" });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Task");
  });

  test("DELETE /tasks/:id — удалить задачу", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

afterAll(async () => {
    await pool.end();
  });
  
