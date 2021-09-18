const express = require("express");
const { Studio, validate } = require("../models/Studio");
const { User } = require("../models/User");
const findStudio = require("../middlewares/findStudio");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const signup = require("../middlewares/signup");
const isStudio = require("../middlewares/isStudio");
const checkStudioId = require("../middlewares/checkStudioId");

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
router.post("/", signup, async (req, res) => {
  const { error } = validate(req.body.studio);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = { _id: req.user._id, email: req.user.email };

  const studio = new Studio({
    name: req.body.studio.name,
    user,
  });

  req.user.role = "Studio";
  await req.user.save();
  await studio.save();

  const token = req.user.generateAuthToken();
  res.header("x-auth-token", token).status(201).json(studio);
});

// Update a studio
router.put("/:id", auth, isStudio, validateId, checkStudioId, findStudio, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

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
