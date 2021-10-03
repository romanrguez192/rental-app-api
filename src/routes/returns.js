const express = require("express");
const { Movie } = require("../models/Movie");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isCustomer = require("../middlewares/isCustomer");
const checkRentalCustomer = require("../middlewares/checkRentalCustomer");

const findRental = find("rental");
const validateId = validateObjectId("rental");
const router = express.Router();

// Return a movie
router.post("/:id", auth, isCustomer, validateId, findRental, checkRentalCustomer, async (req, res) => {
  const rental = req.rental;

  if (rental.returnDate) {
    return res.status(400).send("Movie already returned");
  }

  rental.returnDate = new Date();
  await rental.save();

  await Movie.updateOne({ _id: rental.movie }, { $inc: { numberInStock: 1 } });

  res.json(rental);
});

module.exports = router;
