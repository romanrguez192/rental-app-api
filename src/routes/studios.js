const express = require("express");
const { Studio, validate, validateUpdate } = require("../models/Studio");
const validateId = require("../middlewares/validateId");
const router = express.Router();

// Get all studios
router.get("/", async (req, res) => {
  const studios = await Studio.find().select("-__v").sort("name");
  res.json(studios);
});

// Get one studio
router.get("/:id", validateId, async (req, res) => {
  const studio = await Studio.findById(req.params.id).select("-__v").populate("user", "_id email");

  if (!studio) {
    return res.status(404).send("The studio with the given ID was not found");
  }

  res.json(studio);
});

// Create a studio
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let studio = await Studio.findOne({ user: req.body.user });
  if (studio) {
    return res.status(400).send("A studio for the given user already exists");
  }

  studio = new Studio({ name: req.body.name });
  await studio.save();

  res.status(201).json(studio);
});

// Update a studio
router.put("/:id", validateId, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const studio = await Studio.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!studio) {
    return res.status(404).send("The studio with the given ID was not found");
  }

  res.json(studio);
});

// Delete a studio
router.delete("/:id", validateId, async (req, res) => {
  const studio = await Studio.findByIdAndRemove(req.params.id);

  if (!studio) {
    return res.status(404).send("The studio with the given ID was not found");
  }

  res.json(studio);
});

module.exports = router;
