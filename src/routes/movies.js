const express = require("express");
const { Movie } = require("../models/Movie");
const { Genre } = require("../models/Genre");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isStudio = require("../middlewares/isStudio");
const checkMovieStudio = require("../middlewares/checkMovieStudio");
const validate = require("../middlewares/validate");

const validateMovie = validate("movie");
const findMovie = find("movie");
const validateId = validateObjectId("movie");
const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  const movies = await Movie.find().select("-cast").sort("title").populate("genre").populate("studio", "-user");
  res.json(movies);
});

// Get one movie
router.get("/:id", validateId, findMovie, async (req, res) => {
  await req.movie.populate("genre");
  await req.movie.populate("studio", "-user");
  await req.movie.populate("cast.actor");
  res.json(req.movie);
});

// Create a movie
router.post("/", auth, isStudio, validateMovie, async (req, res) => {
  const genre = await Genre.findById(req.body.genre);
  if (!genre) {
    return res.status(400).send("There is no genre with ID " + req.body.genre);
  }

  const movie = new Movie({ ...req.body, studio: req.user.studio._id });
  await movie.save();

  res.status(201).json(movie);
});

// Update a movie
router.put("/:id", auth, isStudio, validateId, findMovie, checkMovieStudio, validateMovie, async (req, res) => {
  const genre = await Genre.findById(req.body.genre);
  if (!genre) {
    return res.status(400).send("There is no genre with ID " + req.body.genre);
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
