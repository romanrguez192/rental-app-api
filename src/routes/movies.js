const express = require("express");
const { Movie, validate, validateUpdate } = require("../models/Movie");
const { Genre } = require("../models/Genre");
const findMovie = require("../middlewares/findMovie");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isStudio = require("../middlewares/isStudio");
const checkMovieStudio = require("../middlewares/checkMovieStudio");

const validateId = validateObjectId("movie");
const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("title").populate("genre").populate("studio", "-user");
  res.json(movies);
});

// Get one movie
router.get("/:id", validateId, findMovie, async (req, res) => {
  await req.movie.populate(["genre", "studio", "cast.actor"]);
  res.json(req.movie);
});

// Create a movie
router.post("/", auth, isStudio, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status(400).send("There is no genre with ID " + req.body.genreId);
  }

  const movie = new Movie({ ...req.body, studio: req.user.studio._id });
  await movie.save();

  res.status(201).json(movie);
});

// Update a movie
router.put("/:id", auth, isStudio, validateId, findMovie, checkMovieStudio, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status(400).send("There is no genre with ID " + req.body.genreId);
  }

  req.movie.set(req.body);
  await req.movie.save();

  res.json(req.movie);
});

// Delete a movie
router.delete("/:id", auth, isStudio, validateId, findMovie, checkMovieStudio, async (req, res) => {
  await req.movie.remove();
  res.send("Movie deleted");
});

module.exports = router;
