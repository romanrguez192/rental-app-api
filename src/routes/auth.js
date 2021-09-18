const express = require("express");
const { User, validate } = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/signup", (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("This user is already registered");
  }

  const password = await bcrypt.hash(req.body.password, 10);

  user = new User({ email: req.body.email, password });
  await user.save();

  const token = user.generateAuthToken();
  user = { _id: user._id, email: user.email };

  res.header("x-auth-token", token).status(201).json(user);
});

router.get("/login", (req, res) => {
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

  const token = user.generateAuthToken();
  res.json({ token });
});

module.exports = router;
