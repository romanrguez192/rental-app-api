const express = require("express");
const { Studio } = require("../models/Studio");
const { User } = require("../models/User");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const signup = require("../middlewares/signup");
const isStudio = require("../middlewares/isStudio");
const checkStudioId = require("../middlewares/checkStudioId");
const validate = require("../middlewares/validate");

const validateStudio = validate("studio");
const validateUser = validate("user");
const findStudio = find("studio");
const validateId = validateObjectId("studio");
const router = express.Router();

// Get all studios
router.get("/", async (req, res) => {
  const studios = await Studio.find("-user").sort("name");
  res.json(studios);
});

// Get one studio
router.get("/:id", validateId, findStudio, async (req, res) => {
  res.json(req.studio);
});

// Create a studio
router.post("/", validateUser, signup, validateStudio, async (req, res) => {
  const user = { _id: req.user._id, email: req.user.email };

  const studio = new Studio({ ...req.body.studio, user });

  req.user.role = "Studio";
  await req.user.save();
  await studio.save();

  const token = req.user.generateAuthToken();
  res.header("x-auth-token", token).status(201).json(studio);
});

// Update a studio
router.put("/:id", auth, isStudio, validateId, checkStudioId, findStudio, validateStudio, async (req, res) => {
  req.studio.set(req.body);
  await req.studio.save();

  res.json(req.studio);
});

// Delete a studio
router.delete("/:id", auth, isStudio, validateId, checkStudioId, findStudio, async (req, res) => {
  await req.studio.remove();
  res.send("Studio deleted");
});

module.exports = router;
