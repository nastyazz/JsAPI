import request from "supertest";
import app from "../server.js";
import pool from "../db.js";

let token = "";
let userId = null;

beforeAll(async () => {
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM tasks");
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE tasks_id_seq RESTART WITH 1");
});

describe("Auth flow", () => {
  test("Регистрация нового пользователя", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "testuser", password: "12345" });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("username", "testuser");
    userId = res.body.user.id;
  });

  test("Логин пользователя и получение токена", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "testuser", password: "12345" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });
});

describe("Tasks API", () => {
  test("Создание задачи с токеном", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: userId,
        title: "Test Task",
        description: "Task for testing"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Test Task");
  });

  test("Доступ без токена запрещён", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await pool.end();
});
