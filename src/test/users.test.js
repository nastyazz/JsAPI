import request from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("Users API", () => {
  let userId;

  beforeAll(async () => {
    await pool.query("DELETE FROM users");
  });

  test("POST /users — создать пользователя", async () => {
    const res = await request(app)
      .post("/users")
      .send({ username: "user1", password: "pass" });

    expect(res.statusCode).toBe(200);
    userId = res.body.id;
  });

  test("GET /users — получить всех пользователей", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /users/:id — получить пользователя по ID", async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("user1");
  });

  test("DELETE /users/:id — удалить пользователя", async () => {
    const res = await request(app).delete(`/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Пользователь удалён");
  });
});

afterAll(async () => {
    await pool.end();
  });
  
