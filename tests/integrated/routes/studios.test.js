const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Studio } = require("../../../src/models/Studio");
const { User } = require("../../../src/models/User");
const { Customer } = require("../../../src/models/Customer");

describe("/api/studios", () => {
  afterEach(async () => {
    server.close();
    await User.deleteMany();
    await Studio.deleteMany();
  });

  describe("GET /", () => {
    it("should return all studios", async () => {
      const studios = [
        {
          name: "studio1",
          user: {
            _id: mongoose.Types.ObjectId(),
            email: "email@mail.com",
          },
        },
        {
          name: "studio2",
          user: {
            _id: mongoose.Types.ObjectId(),
            email: "email@mail.com",
          },
        },
      ];

      await Studio.insertMany(studios);

      const res = await request(server).get("/api/studios");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((s) => s.name === studios[0].name)).toBe(true);
      expect(res.body.some((s) => s.name === studios[1].name)).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/studios/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no studio with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/studios/" + id);

      expect(res.status).toBe(404);
    });

    it("should return a studio if a valid id is passed and the studio exists", async () => {
      const studio = new Studio({
        name: "studio",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await studio.save();

      const res = await request(server).get("/api/studios/" + studio._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", studio.name);
      expect(res.body).toHaveProperty("user._id", studio.user._id.toString());
      expect(res.body).toHaveProperty("user.email", studio.user.email);
    });
  });

  describe("POST /", () => {
    let body;

    const sendRequest = () => {
      return request(server).post("/api/studios").send(body);
    };

    beforeEach(() => {
      body = {
        studio: {
          name: "studio",
        },
        user: {
          email: "email@mail.com",
          password: "123456",
        },
      };
    });

    it("should return 400 if the user email is missing", async () => {
      body.user.email = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user email is not a valid email", async () => {
      body.user.email = "12345";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password is missing", async () => {
      body.user.password = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password has less than 6 characters", async () => {
      body.user.password = "12345";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password has more than 255 characters", async () => {
      body.user.password = new Array(257).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user already exists", async () => {
      await sendRequest();
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the studio name is missing", async () => {
      body.studio.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the studio name has less than 5 characters", async () => {
      body.studio.name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the studio name has more than 60 characters", async () => {
      body.studio.name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should save the user if it's valid", async () => {
      await sendRequest();
      const user = await User.find({ email: body.user.email });

      expect(user).not.toBeNull();
    });

    it("should save the studio if it's valid", async () => {
      await sendRequest();
      const studio = await Studio.find(body.studio);

      expect(studio).not.toBeNull();
    });

    it("should return 201 if the user and studio were created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should return the studio if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", body.studio.name);
      expect(res.body).toHaveProperty("user._id");
      expect(res.body).toHaveProperty("user.email", body.user.email);
    });

    // TODO: El Token
  });

  describe("PUT /:id", () => {
    let token;
    let studio;
    let id;

    const sendRequest = async () => {
      return request(server)
        .put("/api/studios/" + id)
        .set("x-auth-token", token)
        .send(studio);
    };

    beforeEach(async () => {
      // Before each test we need to create a studio and
      // put it in the database.
      oldStudio = new Studio({
        name: "studio",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await oldStudio.save();

      token = oldStudio.generateAuthToken();
      id = oldStudio._id;
      studio = { name: "new name" };
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

    it("should return 403 if the studio is a different studio", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 404 if the studio with the given id was not found", async () => {
      const studio = new Studio({ user: {} });
      token = studio.generateAuthToken();
      id = studio._id;
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the name is missing", async () => {
      studio.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 5 characters", async () => {
      studio.name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the studio has more than 60 characters", async () => {
      studio.name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should update the studio if the input is valid", async () => {
      await sendRequest();
      const updatedStudio = await Studio.findById(id);

      expect(updatedStudio.name).toBe(studio.name);
    });

    it("should return 200 if the studio was updated", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });

    it("should return the updated studio if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", studio.name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    const sendRequest = async () => {
      return await request(server)
        .delete("/api/studios/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a studio and
      // put it in the database.
      const studio = new Studio({
        name: "studio",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await studio.save();

      id = studio._id;
      token = studio.generateAuthToken();
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

    it("should return 403 if the studio is a different studio", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 404 if the studio with the given id was not found", async () => {
      const studio = new Studio({ user: {} });
      token = studio.generateAuthToken();
      id = studio._id;
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should delete the studio if it exists", async () => {
      await sendRequest();
      const studio = await Studio.findById(id);

      expect(studio).toBeNull();
    });

    it("should return 200 if the studio was deleted", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });
  });
});
