const express = require("express");
const { Genre, validate } = require("../models/Genre");
const validateId = require("../middlewares/validateId");
const router = express.Router();

// Get all genres
router.get("/", async (req, res) => {
  const genres = await Genre.find().select("-__v").sort("name");
  res.json(genres);
});

// Get one genres
router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id).select("-__v");

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found");
  }

  res.json(genre);
});

// Create a genre
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = new Genre({ name: req.body.name });
  await genre.save();

  res.status(201).json(genre);
});

// Update a genre
router.put("/:id", validateId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found");
  }

  res.json(genre);
});

// Delete a genre
router.delete("/:id", validateId, async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found");
  }

  res.json(genre);
});

module.exports = router;
