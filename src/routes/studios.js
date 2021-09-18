const express = require("express");
const { Studio, validate, validateUpdate } = require("../models/Studio");
const { User } = require("../models/User");
const findStudio = require("../middlewares/findStudio");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");

const validateId = validateObjectId("studio");
const router = express.Router();

// Get all studios
router.get("/", async (req, res) => {
  const studios = await Studio.find().sort("name");
  res.json(studios);
});

// Get one studio
router.get("/:id", validateId, findStudio, async (req, res) => {
  await req.studio.populate("user", "_id email");
  res.json(req.studio);
});

// Create a studio
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.status(400).send("There is no user with ID " + req.body.userId);
  }

  let studio = await Studio.findOne({ user: req.body.user });
  if (studio) {
    return res.status(400).send("A studio for the given user already exists");
  }

  studio = new Studio({
    name: req.body.name,
    user: req.body.userId,
  });

  await studio.save();

  res.status(201).json(studio);
});

// Update a studio
router.put("/:id", auth, validateId, findStudio, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.studio.name = req.body.name;
  await req.studio.save();

  res.json(studio);
});

// Delete a studio
router.delete("/:id", auth, validateId, findStudio, async (req, res) => {
  await req.studio.remove();
  res.send("Studio deleted");
});

module.exports = router;
