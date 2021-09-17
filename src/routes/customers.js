const express = require("express");
const { Customer, validate, validateUpdate } = require("../models/Customer");
const { User } = require("../models/User");
const findCustomer = require("../middlewares/findCustomer");
const validateObjectId = require("../middlewares/validateObjectId");

const validateId = validateObjectId("customer");
const router = express.Router();

// Get all customers
router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.json(customers);
});

// Get one customer
router.get("/:id", validateId, findCustomer, async (req, res) => {
  await req.customer.populate("user", "_id email");
  res.json(req.customer);
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
router.put("/:id", validateId, findCustomer, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.customer.set({ name: req.body.name, phone: req.body.phone });
  await req.customer.save();

  res.json(req.customer);
});

// Delete a customer
router.delete("/:id", validateId, findCustomer, async (req, res) => {
  await req.customer.remove();
  res.send("Customer deleted");
});

module.exports = router;
