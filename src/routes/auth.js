const express = require("express");
const { User, validate } = require("../models/User");
const { Customer } = require("../models/Customer");
const { Studio } = require("../models/Studio");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(404).send("Invalid email or password.");
  }

  if (user.role === "Customer") {
    const customer = await Customer.findOne({ "user._id": user._id });
    const token = customer.generateAuthToken();
    return res.json({ token });
  }

  const studio = await Studio.findOne({ "user._id": user._id });
  const token = studio.generateAuthToken();
  res.json({ token });
});

module.exports = router;
