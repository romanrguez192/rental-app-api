const express = require("express");
const { Customer, validate } = require("../models/Customer");
const { User } = require("../models/User");
const findCustomer = require("../middlewares/findCustomer");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const signup = require("../middlewares/signup");
const isCustomer = require("../middlewares/isCustomer");
const checkCustomerId = require("../middlewares/checkCustomerId");

const validateId = validateObjectId("customer");
const router = express.Router();

// Get all customers
router.get("/", async (req, res) => {
  const customers = await Customer.find("-user").sort("name");
  res.json(customers);
});

// Get one customer
router.get("/:id", validateId, findCustomer, async (req, res) => {
  res.json(req.customer);
});

// Create a customer
router.post("/", signup, async (req, res) => {
  const { error } = validate(req.body.customer);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = { _id: req.user._id, email: req.user.email };

  const customer = new Customer({
    name: req.body.customer.name,
    phone: req.body.customer.phone,
    user,
  });

  req.user.role = "Customer";
  await req.user.save();
  await customer.save();

  const token = req.user.generateAuthToken();
  res.header("x-auth-token", token).status(201).json(customer);
});

// Update a customer
router.put("/:id", auth, isCustomer, validateId, checkCustomerId, findCustomer, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.customer.set(req.body);
  await req.customer.save();

  res.json(req.customer);
});

// Delete a customer
router.delete("/:id", auth, isCustomer, validateId, checkCustomerId, findCustomer, async (req, res) => {
  await req.customer.remove();
  res.send("Customer deleted");
});

module.exports = router;
