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

  let customerBody;
  let studioBody;

  const jwtSecretKey = config.get("jwtSecretKey");

  const sendRequestAsCustomer = () => {
    return request(server).post("/api/auth").send(customerBody);
  };

  const sendRequestAsStudio = () => {
    return request(server).post("/api/auth").send(studioBody);
  };

  beforeEach(async () => {
    const studioUser = {
      studio: {
        name: "studio",
      },
      user: {
        email: "studio@mail.com",
        password: "123456",
      },
    };

    const customerUser = {
      customer: {
        name: "customer",
        phone: "1234567890",
      },
      user: {
        email: "customer@mail.com",
        password: "123456",
      },
    };

    await request(server).post("/api/customers").send(customerUser);
    await request(server).post("/api/studios").send(studioUser);

    customerBody = {
      email: customerUser.user.email,
      password: customerUser.user.password,
    };

    studioBody = {
      email: studioUser.user.email,
      password: studioUser.user.password,
    };
  });

  it("should return 400 if the email is missing", async () => {
    customerBody.email = undefined;
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(400);
  });

  it("should return 400 if the password is missing", async () => {
    customerBody.password = undefined;
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(400);
  });

  it("should return 400 if the email is missing", async () => {
    customerBody.email = undefined;
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(400);
  });

  it("should return 404 if the email is incorrect", async () => {
    customerBody.email = "email2@mail.com";
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(404);
  });

  it("should return 404 if the password is incorrect", async () => {
    customerBody.email = "1234567";
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(400);
  });

  it("should return 200 if the customer email and password are correct", async () => {
    const res = await sendRequestAsCustomer();

    expect(res.status).toBe(200);
  });

  it("should return a valid token if the customer email and password are correct", async () => {
    const res = await sendRequestAsCustomer();

    expect(() => jwt.verify(res.body.token, jwtSecretKey)).not.toThrow();
  });

  it("should return 200 if the studio email and password are correct", async () => {
    const res = await sendRequestAsStudio();

    expect(res.status).toBe(200);
  });

  it("should return a valid token if the studio email and password are correct", async () => {
    const res = await sendRequestAsStudio();

    expect(() => jwt.verify(res.body.token, jwtSecretKey)).not.toThrow();
  });
});
