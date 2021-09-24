const request = require("supertest");
const server = require("../../../src/");
const { Studio } = require(".../../../src/models/Studio");
const { Actor } = require(".../../../src/models/Actor");

describe("auth middleware", () => {
  afterEach(async () => {
    server.close();
    await Actor.deleteMany();
  });

  const sendRequest = (token) => {
    return request(server).post("/api/actors").set("x-auth-token", token).send({ name: "actor" });
  };

  it("should return 401 if no token was provided", async () => {
    const token = "";
    const res = await sendRequest(token);

    expect(res.status).toBe(401);
  });

  it("should return 401 if the token is invalid", async () => {
    const token = "a";
    const res = await sendRequest(token);

    expect(res.status).toBe(401);
  });

  it("should return 200 if the token is valid", async () => {
    const token = new Studio({ user: {} }).generateAuthToken();
    const res = await sendRequest(token);

    expect(res.status).toBe(201);
  });
});
