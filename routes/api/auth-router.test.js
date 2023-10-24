/* eslint-disable no-undef */
const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../../app.js");
const { User } = require("../../models/User.js");

const { TEST_DB_HOST, PORT = 3000 } = process.env;

describe("test login route", () => {
  let server = null;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_HOST);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  test("test register with correct data", async () => {
    const registerData = {
      email: "test@test.com",
      password: "test123456",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/register")
      .send(registerData);

    expect(statusCode).toBe(201);
    expect(body.email).toBe(registerData.email);

    const user = await User.findOne({
      email: registerData.email,
    });

    expect(user).toBeDefined();
    expect(typeof user.email).toBe("string");
    expect(user.email).toBe(registerData.email);
  });

  test("test register with invalid email format", async () => {
    const invalidEmailRegisterData = {
      email: "invalidemail",
      password: "test123456",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/register")
      .send(invalidEmailRegisterData);

    expect(statusCode).toBe(400);
    expect(body.message).toContain(
      '"email" with value "invalidemail" fails to match the required pattern: /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/'
    );
  });

  test("test register with short password", async () => {
    const shortPasswordRegisterData = {
      email: "test@test.com",
      password: "short",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/register")
      .send(shortPasswordRegisterData);
    expect(statusCode).toBe(400);
    expect(body.message).toContain(
      '"password" length must be at least 6 characters long'
    );
  });

  test("test register with duplicate email", async () => {
    const existingUser = {
      email: "test@test.com",
      password: "test123456",
    };

    await request(app)
      .post("/api/users/register")
      .send(existingUser)
      .expect(201);

    const duplicateEmailUser = {
      email: "test@test.com",
      password: "newpassword123",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/register")
      .send(duplicateEmailUser);

    expect(statusCode).toBe(409);
    expect(body.message).toContain("test@test.com in use");
  });

  test("test login with correct data", async () => {
    const registerData = {
      email: "test@test.com",
      password: "test123456",
    };

    const signup = await request(app)
      .post("/api/users/register")
      .send(registerData);
    const loginData = {
      email: "test@test.com",
      password: "test123456",
    };

    const { body } = await request(app)
      .post("/api/users/login")
      .send(loginData)
      .expect(200);

    expect(body.token).toBeDefined();

    expect(body.user.email).toBe(loginData.email);
    expect(typeof body.user.email).toBe("string");
    expect(body.user.subscription).toBeDefined();
    expect(typeof body.user.subscription).toBe("string");
  });

  test("test login with wrong email", async () => {
    const registerData = {
      email: "test@test.com",
      password: "test123456",
    };

    const signup = await request(app)
      .post("/api/users/register")
      .send(registerData);

    const wrongEmailLoginData = {
      email: "wrong@email.com",
      password: "test123456",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/login")
      .send(wrongEmailLoginData);

    expect(statusCode).toBe(401);
    expect(body.message).toContain("Email or password is wrong");
  });

  test("test login with wrong password", async () => {
    const registerData = {
      email: "test@test.com",
      password: "test123456",
    };

    const signup = await request(app)
      .post("/api/users/register")
      .send(registerData);

    const wrongPasswordLoginData = {
      email: "test@test.com",
      password: "test1234567",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/login")
      .send(wrongPasswordLoginData);

    expect(statusCode).toBe(401);
    expect(body.message).toContain("Email or password is wrong");
  });
});
