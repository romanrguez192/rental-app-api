const express = require("express");
const { Genre, validate } = require("../models/Genre");
const findGenre = require("../middlewares/findGenre");
const validateObjectId = require("../middlewares/validateObjectId");

const validateId = validateObjectId("genre");
const router = express.Router();

// Get all genres
router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.json(genres);
});

// Get one genre
router.get("/:id", validateId, findGenre, async (req, res) => {
  res.json(req.genre);
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
router.patch("/:id", validateId, findGenre, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.genre.name = req.body.name;
  await req.genre.save();

  res.json(req.genre);
});

// Delete a genre
router.delete("/:id", validateId, findGenre, async (req, res) => {
  await req.genre.remove();
  res.send("Genre deleted");
});

module.exports = router;
