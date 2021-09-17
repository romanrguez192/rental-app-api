const express = require("express");
const { Customer, validate, validateUpdate } = require("../models/Customer");
const { User } = require("../models/User");
const validateId = require("../middlewares/validateObjectId");
const router = express.Router();

// Get all customers
router.get("/", async (req, res) => {
  const customers = await Customer.find().select("-__v").sort("name");
  res.json(customers);
});

// Get one customer
router.get("/:id", validateId, async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("-__v").populate("user", "_id email");

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found");
  }

  res.json(customer);
});

// Create a customer
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.status(400).send("There is no user with ID " + req.body.userId);
  }

  let customer = await Customer.findOne({ user: req.body.user });
  if (customer) {
    return res.status(400).send("A customer for the given user already exists");
  }

  customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    user: req.body.userId,
  });

  await customer.save();

  res.status(201).json(customer);
});

// Update a customer
router.put("/:id", validateId, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone },
    { new: true }
  );

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found");
  }

  res.json(customer);
});

// Delete a customer
router.delete("/:id", validateId, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found");
  }

  res.send("Customer deleted");
});

module.exports = router;
