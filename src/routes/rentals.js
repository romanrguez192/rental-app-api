const express = require("express");
const { Rental } = require("../models/Rental");
const { Customer } = require("../models/Customer");
const { Movie } = require("../models/Movie");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isCustomer = require("../middlewares/isCustomer");
const validate = require("../middlewares/validate");
const checkRentalCustomer = require("../middlewares/checkRentalCustomer");

const validateRental = validate("rental");
const findRental = find("rental");
const validateId = validateObjectId("rental");
const router = express.Router();

// Get all rentals
router.get("/", auth, isCustomer, async (req, res) => {
  const rentals = await Rental.find({ customer: req.user.customer._id }).sort("date").populate("movie");
  res.json(rentals);
});

// Get one rental
router.get("/:id", auth, isCustomer, validateId, findRental, checkRentalCustomer, async (req, res) => {
  await rental.populate("movie");
  res.json(req.rental);
});

// Create a rental
router.post("/", auth, isCustomer, validateRental, async (req, res) => {
  const movie = await Movie.findById(req.body.movie);
  if (!movie) {
    return res.status(400).send("There is no movie with ID " + req.body.movie);
  }

  if (movie.numberInStock === 0) {
    return res.status(400).send("This movie isn't in stock");
  }

  movie.numberInStock--;
  await movie.save();

  const rental = new Rental({ customer: req.user.customer._id, movie: req.body.movie });
  await rental.save();

  res.status(201).json(rental);
});

module.exports = router;
