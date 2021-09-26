const express = require("express");
const { Genre } = require("../models/Genre");
const { Movie } = require("../models/Movie");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isStudio = require("../middlewares/isStudio");
const validate = require("../middlewares/validate");

const validateGenre = validate("genre");
const findGenre = find("genre");
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
router.post("/", auth, isStudio, validateGenre, async (req, res) => {
  const genre = new Genre(req.body);
  await genre.save();

  res.status(201).json(genre);
});

// Update a genre
router.put("/:id", auth, isStudio, validateId, findGenre, validateGenre, async (req, res) => {
  req.genre.set(req.body);
  await req.genre.save();

  res.json(req.genre);
});

// Delete a genre
router.delete("/:id", auth, isStudio, validateId, findGenre, async (req, res) => {
  const canDelete = !(await Movie.findOne({ genre: req.params.id }));

  if (!canDelete) {
    return res.status(400).send("Cannot delete the genre");
  }

  await req.genre.remove();
  res.send("Genre deleted");
});

module.exports = router;
