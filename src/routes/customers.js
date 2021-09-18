const express = require("express");
const { Customer } = require("../models/Customer");
const { User } = require("../models/User");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const signup = require("../middlewares/signup");
const isCustomer = require("../middlewares/isCustomer");
const checkCustomerId = require("../middlewares/checkCustomerId");
const validate = require("../middlewares/validate");

const validateCustomer = validate("customer");
const validateUser = validate("user");
const findCustomer = find("customer");
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
router.post("/", validateUser, signup, validateCustomer, async (req, res) => {
  const user = { _id: req.user._id, email: req.user.email };

  const customer = new Customer({ ...req.body.customer, user });

  req.user.role = "Customer";
  await req.user.save();
  await customer.save();

  const token = req.user.generateAuthToken();
  res.header("x-auth-token", token).status(201).json(customer);
});

// Update a customer
router.put("/:id", auth, isCustomer, validateId, checkCustomerId, findCustomer, validateCustomer, async (req, res) => {
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
