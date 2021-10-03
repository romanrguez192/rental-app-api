const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Rental } = require("../../../src/models/Rental");
const { Customer } = require("../../../src/models/Customer");
const { Studio } = require("../../../src/models/Studio");
const { Movie } = require("../../../src/models/Movie");

describe("/api/rentals", () => {
  afterEach(async () => {
    server.close();
    await Rental.deleteMany();
    await Customer.deleteMany();
    await Movie.deleteMany();
  });

  let customer;
  let movie;
  let token;

  beforeEach(async () => {
    customer = new Customer({
      name: "customer",
      phone: "1234567890",
      user: {
        _id: mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    await customer.save();

    movie = new Movie({
      title: "movie",
      genre: mongoose.Types.ObjectId(),
      studio: mongoose.Types.ObjectId(),
      releaseDate: "2000-01-01",
      numberInStock: 50,
      cast: [
        {
          actor: mongoose.Types.ObjectId(),
          characters: ["12345"],
        },
      ],
    });

    await movie.save();

    token = customer.generateAuthToken();
  });

  describe("GET /", () => {
    const sendRequest = () => {
      return request(server).get("/api/rentals").set("x-auth-token", token);
    };

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

    it("should return 403 if the user is not a customer", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return all the customer rentals", async () => {
      const rentals = [
        {
          customer: customer._id,
          movie: movie._id,
        },
        {
          customer: mongoose.Types.ObjectId(),
          movie: movie._id,
        },
      ];

      await Rental.insertMany(rentals);

      const res = await sendRequest();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body).toContainEqual(expect.objectContaining({ customer: customer._id.toString() }));
    });
  });

  describe("GET /:id", () => {
    let rental;

    beforeEach(async () => {
      rental = new Rental({
        customer: customer._id,
        movie: movie._id,
      });

      await rental.save();
    });

    const sendRequest = () => {
      return request(server)
        .get("/api/rentals/" + rental._id)
        .set("x-auth-token", token);
    };

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

    it("should return 403 if the user is not a customer", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/rentals/1").set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    it("should return 404 if no rental with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server)
        .get("/api/rentals/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 403 if the customer doesn't own the rental", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return a rental if a valid id is passed and the rental exists", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("customer", rental.customer.toString());
      expect(res.body).toHaveProperty("movie._id", rental.movie.toString());
      expect(res.body).toHaveProperty("date", rental.date.toISOString());
    });
  });

  describe("POST /", () => {
    let body;

    const sendRequest = () => {
      return request(server).post("/api/rentals").set("x-auth-token", token).send(body);
    };

    beforeEach(() => {
      body = {
        movie: movie._id,
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

    it("should return 403 if the user is not a customer", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the movie is missing", async () => {
      body.movie = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the movie doesn't have a valid id", async () => {
      body.movie = 1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the movie doesn't exists", async () => {
      body.movie = mongoose.Types.ObjectId();
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the movie isn't in stock", async () => {
      movie.numberInStock = 0;
      await movie.save();

      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 201 if the user and rental were created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should save the rental if it's valid", async () => {
      await sendRequest();
      const rental = await Rental.findOne({ customer: customer._id });

      expect(rental).not.toBeNull();
    });

    it("should update the movie stock", async () => {
      await sendRequest();
      const updatedMovie = await Movie.findById(movie._id);

      expect(updatedMovie.numberInStock).toBe(movie.numberInStock - 1);
    });

    it("should return the rental if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer", customer._id.toString());
      expect(res.body).toHaveProperty("movie", movie._id.toString());
      expect(res.body).toHaveProperty("date");
    });
  });
});
