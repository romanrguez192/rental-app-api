const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Rental } = require("../../../src/models/Rental");
const { Customer } = require("../../../src/models/Customer");
const { Studio } = require("../../../src/models/Studio");
const { Movie } = require("../../../src/models/Movie");

describe("/api/return", () => {
  afterEach(async () => {
    server.close();
    await Rental.deleteMany();
    await Customer.deleteMany();
    await Movie.deleteMany();
  });

  let id;
  let token;
  let rental;
  let movie;

  beforeEach(async () => {
    const customer = new Customer({
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

    rental = new Rental({
      customer: customer._id,
      movie: movie._id,
    });

    await rental.save();

    token = customer.generateAuthToken();

    id = rental._id;
  });

  const sendRequest = () => {
    return request(server)
      .post("/api/return/" + id)
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
    id = 1;
    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental with the given id exists", async () => {
    id = mongoose.Types.ObjectId();
    const res = await sendRequest();

    expect(res.status).toBe(404);
  });

  it("should return 403 if the customer doesn't own the rental", async () => {
    token = new Customer({ user: {} }).generateAuthToken();
    const res = await sendRequest();

    expect(res.status).toBe(403);
  });

  it("should return 400 if the movie was already returned", async () => {
    rental.returnDate = new Date();
    await rental.save();

    const res = await sendRequest();

    expect(res.status).toBe(400);
  });

  it("should return 200 if the movie is returned", async () => {
    const res = await sendRequest();

    expect(res.status).toBe(200);
  });

  it("should set the return date if it's returned", async () => {
    await sendRequest();

    const updatedRental = await Rental.findById(rental._id);

    const diff = new Date() - updatedRental.returnDate;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should update the movie stock", async () => {
    await sendRequest();
    const updatedMovie = await Movie.findById(movie._id);

    expect(updatedMovie.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the updated rental", async () => {
    const res = await sendRequest();

    expect(res.body).toHaveProperty("_id", rental._id.toString());
    expect(res.body).toHaveProperty("customer", rental.customer.toString());
    expect(res.body).toHaveProperty("movie", rental.movie.toString());
    expect(res.body).toHaveProperty("date", rental.date.toISOString());
    expect(res.body).toHaveProperty("returnDate");
  });
});
