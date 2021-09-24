const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Actor } = require("../../../src/models/Actor");
const { Studio } = require("../../../src/models/Studio");
const { Customer } = require("../../../src/models/Customer");

describe("/api/actors", () => {
  afterEach(async () => {
    server.close();
    await Actor.deleteMany();
  });

  describe("GET /", () => {
    it("should return all actors", async () => {
      const actors = [{ name: "actor1" }, { name: "actor2" }];

      await Actor.insertMany(actors);

      const res = await request(server).get("/api/actors");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.name === "actor1")).toBe(true);
      expect(res.body.some((a) => a.name === "actor2")).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/actors/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no actor with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/actors/" + id);

      expect(res.status).toBe(404);
    });

    it("should return an actor if a valid id is passed and the actor exists", async () => {
      const actor = new Actor({ name: "actor1" });
      await actor.save();

      const res = await request(server).get("/api/actors/" + actor._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", actor.name);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const sendRequest = () => {
      return request(server).post("/api/actors").set("x-auth-token", token).send({ name });
    };

    beforeEach(() => {
      token = new Studio({ user: {} }).generateAuthToken();
      name = "actor";
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the token is invalid", async () => {
      token = "a";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not a studio", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the name is missing", async () => {
      name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 5 characters", async () => {
      name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has more than 60 characters", async () => {
      name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should save the actor if it's valid", async () => {
      await sendRequest();
      const actor = await Actor.find({ name: "actor" });

      expect(actor).not.toBeNull();
    });

    it("should return 201 if the actor was created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should return the actor if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "actor");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let id;

    const sendRequest = async () => {
      return request(server)
        .put("/api/actors/" + id)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      // Before each test we need to create a actor and
      // put it in the database.
      const actor = new Actor({ name: "actor" });
      await actor.save();

      token = new Studio({ user: {} }).generateAuthToken();
      id = actor._id;
      name = "new name";
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the token is invalid", async () => {
      token = "a";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not a studio", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the id is invalid", async () => {
      id = 1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the actor with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the name is missing", async () => {
      name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 5 characters", async () => {
      name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has more than 60 characters", async () => {
      name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should update the actor if the input is valid", async () => {
      await sendRequest();
      const actor = await Actor.findById(id);

      expect(actor.name).toBe(name);
    });

    it("should return 200 if the actor was updated", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });

    it("should return the updated actor if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    const sendRequest = async () => {
      return await request(server)
        .delete("/api/actors/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a actor and
      // put it in the database.
      const actor = new Actor({ name: "actor" });
      await actor.save();

      id = actor._id;
      token = new Studio({ user: {} }).generateAuthToken();
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the token is invalid", async () => {
      token = "a";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not a studio", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the id is invalid", async () => {
      id = 1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the actor with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should delete the actor if it exists", async () => {
      await sendRequest();
      const actor = await Actor.findById(id);

      expect(actor).toBeNull();
    });

    it("should return 200 if the actor was deleted", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });
  });
});
