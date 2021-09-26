const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Movie } = require("../../../src/models/Movie");
const { Genre } = require("../../../src/models/Genre");
const { Actor } = require("../../../src/models/Actor");
const { Studio } = require("../../../src/models/Studio");
const { Customer } = require("../../../src/models/Customer");

describe("/api/movies", () => {
  afterEach(async () => {
    server.close();
    await Movie.deleteMany();
    await Actor.deleteMany();
    await Studio.deleteMany();
    await Genre.deleteMany();
  });

  let genre;
  let actor;
  let studio;
  let movie;

  beforeEach(async () => {
    // We need to have a genre, an actor and a studio in the database
    genre = new Genre({ name: "genre1" });
    await genre.save();

    actor = new Actor({ name: "actor1" });
    await actor.save();

    studio = new Studio({
      name: "studio",
      user: {
        _id: mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    await studio.save();

    movie = {
      title: "movie1",
      genre: genre._id,
      studio: studio._id,
      releaseDate: new Date("2010-05-05"),
      numberInStock: 50,
      cast: [{ actor: actor._id, characters: ["character1"] }],
    };
  });

  describe("GET /", () => {
    it("should return all movies", async () => {
      const movies = [movie, { ...movie, title: "movie2" }];

      await Movie.insertMany(movies);

      const res = await request(server).get("/api/movies");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          (m) =>
            m.title === movies[0].title &&
            m.genre.name === genre.name &&
            m.studio.name === studio.name &&
            m.releaseDate === movies[0].releaseDate.toISOString() &&
            m.numberInStock === movies[0].numberInStock
        )
      ).toBe(true);
      expect(
        res.body.some(
          (m) =>
            m.title === movies[1].title &&
            m.genre.name === genre.name &&
            m.studio.name === studio.name &&
            m.releaseDate === movies[1].releaseDate.toISOString() &&
            m.numberInStock === movies[1].numberInStock
        )
      ).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/movies/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no movie with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/movies/" + id);

      expect(res.status).toBe(404);
    });

    it("should return a movie if a valid id is passed and the movie exists", async () => {
      const newMovie = new Movie(movie);
      await newMovie.save();

      const res = await request(server).get("/api/movies/" + newMovie._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", movie.title);
      expect(res.body).toHaveProperty("genre.name", genre.name);
      expect(res.body).toHaveProperty("studio.name", studio.name);
      expect(res.body).toHaveProperty("releaseDate", movie.releaseDate.toISOString());
      expect(res.body).toHaveProperty("numberInStock", movie.numberInStock);
      expect(res.body).toHaveProperty("cast.0.actor.name", actor.name);
      expect(res.body).toHaveProperty("cast.0.characters.0", movie.cast[0].characters[0]);
    });
  });

  describe("POST /", () => {
    let token;

    const sendRequest = () => {
      return request(server)
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({ ...movie, studio: undefined });
    };

    beforeEach(() => {
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

    it("should return 400 if the title is missing", async () => {
      movie.title = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the title has less than 3 characters", async () => {
      movie.title = "12";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the title has more than 255 characters", async () => {
      movie.title = new Array(257).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre is missing", async () => {
      movie.genre = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre is not a valid Object ID", async () => {
      movie.genre = "1";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the release date is missing", async () => {
      movie.releaseDate = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the release date is less than 1900-01-01", async () => {
      movie.releaseDate = new Date("1899-12-31");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the stock number is missing", async () => {
      movie.numberInStock = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the stock number is less than 0", async () => {
      movie.numberInStock = -1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the stock number is greater than 100000", async () => {
      movie.numberInStock = 100001;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast is missing", async () => {
      movie.cast = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast is empty", async () => {
      movie.cast = [];
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast doesn't have actors", async () => {
      movie.cast[0].actor = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actors don't have valid Object IDs", async () => {
      movie.cast[0].actor = "1";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actors don't have characters", async () => {
      movie.cast[0].characters = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actor characters are empty", async () => {
      movie.cast[0].characters = [];
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre doesn't exist", async () => {
      movie.genre = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should save the movie if it's valid", async () => {
      await sendRequest();
      const newMovie = await Movie.findOne({ title: movie.title });

      expect(newMovie).not.toBeNull();
    });

    it("should return 201 if the movie was created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should return the movie if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", movie.title);
      expect(res.body).toHaveProperty("genre", movie.genre.toString());
      expect(res.body).toHaveProperty("releaseDate", movie.releaseDate.toISOString());
      expect(res.body).toHaveProperty("numberInStock", movie.numberInStock);
      expect(res.body).toHaveProperty("cast.0.actor", movie.cast[0].actor.toString());
      expect(res.body).toHaveProperty("cast.0.characters.0", movie.cast[0].characters[0]);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let body;
    let id;
    let genre2;
    let actor2;

    const sendRequest = async () => {
      return request(server)
        .put("/api/movies/" + id)
        .set("x-auth-token", token)
        .send(body);
    };

    beforeEach(async () => {
      // Before each test we need to create a movie and
      // put it in the database.
      oldMovie = new Movie(movie);
      await oldMovie.save();

      genre2 = new Genre({ name: "genre2" });
      await genre2.save();

      actor2 = new Actor({ name: "actor2" });
      await actor2.save();

      token = studio.generateAuthToken();
      id = oldMovie._id;

      body = {
        title: "new movie",
        genre: genre2._id,
        releaseDate: new Date("2018-01-01"),
        cast: [{ actor: actor2._id, characters: ["new character"] }],
      };
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

    it("should return 404 if the movie with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 403 if the studio is not owner of the movie", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the title is missing", async () => {
      body.title = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the title has less than 3 characters", async () => {
      body.title = "12";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the title has more than 255 characters", async () => {
      body.title = new Array(257).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre is missing", async () => {
      body.genre = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre is not a valid Object ID", async () => {
      body.genre = "1";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the release date is missing", async () => {
      body.releaseDate = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the release date is less than 1900-01-01", async () => {
      body.releaseDate = new Date("1899-12-31");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast is missing", async () => {
      body.cast = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast is empty", async () => {
      body.cast = [];
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast doesn't have actors", async () => {
      body.cast[0].actor = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actors don't have valid Object IDs", async () => {
      body.cast[0].actor = "1";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actors don't have characters", async () => {
      body.cast[0].characters = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the cast actor characters are empty", async () => {
      body.cast[0].characters = [];
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre doesn't exist", async () => {
      body.genre = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should update the movie if the input is valid", async () => {
      await sendRequest();
      const updatedMovie = await Movie.findById(id);

      expect(updatedMovie).toHaveProperty("title", body.title);
      expect(updatedMovie).toHaveProperty("genre", body.genre);
      expect(updatedMovie).toHaveProperty("studio", movie.studio);
      expect(updatedMovie).toHaveProperty("releaseDate", body.releaseDate);
      expect(updatedMovie).toHaveProperty("numberInStock", movie.numberInStock);
      expect(updatedMovie).toHaveProperty("cast.0.actor", body.cast[0].actor);
      expect(updatedMovie).toHaveProperty("cast.0.characters.0", body.cast[0].characters[0]);
    });

    it("should return 200 if the movie was updated", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });

    it("should return the updated movie if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", body.title);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    const sendRequest = async () => {
      return await request(server)
        .delete("/api/movies/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a movie and
      // put it in the database.
      const oldMovie = new Movie(movie);
      await oldMovie.save();

      id = oldMovie._id;
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

    it("should return 404 if the movie with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 403 if the studio is not owner of the movie", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should delete the movie if it exists", async () => {
      await sendRequest();
      const movie = await Movie.findById(id);

      expect(movie).toBeNull();
    });

    it("should return 200 if the movie was deleted", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });
  });
});
