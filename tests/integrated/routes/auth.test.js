const request = require("supertest");
const server = require("../../../src/");
const { User } = require("../../../src/models/User");
const { Customer } = require("../../../src/models/Customer");
const { Studio } = require("../../../src/models/Studio");
const config = require("config");
const jwt = require("jsonwebtoken");

describe("/api/auth", () => {
  afterEach(async () => {
    server.close();
    await User.deleteMany();
    await Customer.deleteMany();
    await Studio.deleteMany();
  });

  let body;

  const sendRequest = () => {
    return request(server).post("/api/auth").send(body);
  };

  beforeEach(async () => {
    const storedUser = new User({
      email: "email@mail.com",
      password: "123456",
      role: "Studio",
    });

    const customer = new Customer({
      name: "customer",
      phone: "1234567890",
      user: {
        _id: storedUser._id,
        email: storedUser.email,
      },
    });

    const studio = new Studio({
      name: "studio",
      user: {
        _id: storedUser._id,
        email: storedUser.email,
      },
    });

    await storedUser.save();
    await customer.save();
    await studio.save();

    body = { email: storedUser.email, password: storedUser.password };
  });

  it("should return 400 if the email is missing", async () => {
    body.email = undefined;
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 400 if the password is missing", async () => {
    body.password = undefined;
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 400 if the email is missing", async () => {
    body.email = undefined;
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 404 if the email is incorrect", async () => {
    body.email = "email2@mail.com";
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 404 if the password is incorrect", async () => {
    body.email = "1234567";
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return a valid token if the email and password are correct", async () => {
    const res = await sendRequest();

    expect(res.body).toHaveProperty("token");

    const jwtSecretKey = config.get("jwtSecretKey");
    expect(() => jwt.verify(res.body.token, jwtSecretKey)).not.toThrow();

    expect(res.status).toBe(200);
  });
});
