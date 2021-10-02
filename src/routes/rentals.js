const express = require("express");
const { Rental } = require("../models/Rental");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isCustomer = require("../middlewares/isCustomer");
const validate = require("../middlewares/validate");

const validateRental = validate("rental");
const findRental = find("rental");
const validateId = validateObjectId("rental");
const router = express.Router();

// Get all rentals
router.get("/", async (req, res) => {
  const rental = await Rental.find().sort("name");
  res.json(rentals);
});

// Get one rental
router.get("/:id", validateId, findRental, async (req, res) => {
  res.json(req.rental);
});

// Create a rental
router.post("/", auth, isCustomer, validateRental, async (req, res) => {
  const rental = new Rental(req.body);
  await rental.save();

  res.status(201).json(rental);
});

module.exports = router;
