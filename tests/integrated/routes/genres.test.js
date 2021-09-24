const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Genre } = require("../../../src/models/Genre");
const { Studio } = require("../../../src/models/Studio");
const { Customer } = require("../../../src/models/Customer");

describe("/api/genres", () => {
  afterEach(async () => {
    server.close();
    await Genre.deleteMany();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      const genres = [{ name: "genre1" }, { name: "genre2" }];

      await Genre.insertMany(genres);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((a) => a.name === "genre1")).toBe(true);
      expect(res.body.some((a) => a.name === "genre2")).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });

    it("should return a genre if a valid id is passed and the genre exists", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });

  describe("POST /", () => {
    let token;
    let genre;

    const sendRequest = () => {
      return request(server).post("/api/genres").set("x-auth-token", token).send(genre);
    };

    beforeEach(() => {
      token = new Studio({ user: {} }).generateAuthToken();
      genre = { name: "genre" };
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
      genre.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 3 characters", async () => {
      genre.name = "12";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has more than 50 characters", async () => {
      genre.name = new Array(52).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it's valid", async () => {
      await sendRequest();
      const newGenre = await Genre.find(genre);

      expect(newGenre).not.toBeNull();
    });

    it("should return 201 if the genre was created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should return the genre if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let genre;
    let id;

    const sendRequest = async () => {
      return request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send(genre);
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      oldGenre = new Genre({ name: "genre" });
      await oldGenre.save();

      token = new Studio({ user: {} }).generateAuthToken();
      id = oldGenre._id;
      genre = { name: "new name" };
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

    it("should return 404 if the genre with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the name is missing", async () => {
      genre.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 3 characters", async () => {
      genre.name = "12";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has more than 50 characters", async () => {
      genre.name = new Array(52).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should update the genre if the input is valid", async () => {
      await sendRequest();
      const updatedGenre = await Genre.findById(id);

      expect(updatedGenre.name).toBe(genre.name);
    });

    it("should return 200 if the genre was updated", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });

    it("should return the updated genre if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    const sendRequest = async () => {
      return await request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      const genre = new Genre({ name: "genre" });
      await genre.save();

      id = genre._id;
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

    it("should return 404 if the genre with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should delete the genre if it exists", async () => {
      await sendRequest();
      const genre = await Genre.findById(id);

      expect(genre).toBeNull();
    });

    it("should return 200 if the genre was deleted", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });
  });
});
