const express = require("express");
const { Rental } = require("../models/Rental");
const { Movie } = require("../models/Movie");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isCustomer = require("../middlewares/isCustomer");
const validate = require("../middlewares/validate");

const validateRental = validate("rental");
const findRental = find("rental");
const validateId = validateObjectId("rental");
const router = express.Router();

// Return a movie
// TODO: Validate ownership
router.post("/:id", auth, isCustomer, validateId, findRental, async (req, res) => {
  const rental = req.rental;
  rental.returnDate = new Date();
  await rental.save();

  await Movie.updateOne({ _id: rental.movie }, { $inc: { numberInStock: 1 } });

  res.json(rental);
});

module.exports = router;
