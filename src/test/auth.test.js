import request from "supertest";
import app from "../server.js";
import pool from "../db.js";

describe("Auth API", () => {
  let token;

  beforeAll(async () => {
    await pool.query("DELETE FROM users");
  });

  test("POST /auth/register — регистрация нового пользователя", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe("testuser");
  });

  test("POST /auth/login — успешный вход", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "testuser", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("POST /auth/login — неверный пароль", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "testuser", password: "wrong" });

    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await pool.end();
});
