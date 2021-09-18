const express = require("express");
const { Movie, validate } = require("../models/Movie");
const { Genre } = require("../models/Genre");
const { Studio } = require("../models/Studio");
const findMovie = require("../middlewares/findMovie");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");

const validateId = validateObjectId("movie");
const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("title").populate("genre").populate("studio");
  res.json(movies);
});

// Get one movie
router.get("/:id", validateId, findMovie, async (req, res) => {
  await req.movie.populate("genre").populate("studio").populate("cast");
  res.json(req.movie);
});

// Create a movie
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status(400).send("There is no genre with ID " + req.body.genreId);
  }

  const studio = await Studio.findById(req.body.studioId);
  if (!studio) {
    return res.status(400).send("There is no studio with ID " + req.body.studioId);
  }

  const movie = new Movie({
    title: req.body.title,
    genre: req.body.genreId,
    studio: req.body.studioId,
    releaseDate: req.body.releaseDate,
    numberInStock: req.body.numberInStock,
    cast: req.body.cast,
  });
  await movie.save();

  res.status(201).json(movie);
});

// Update a movie
router.put("/:id", auth, validateId, findMovie, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.movie.set({
    title: req.body.title,
    genre: req.body.genreId,
    studio: req.body.studioId,
    releaseDate: req.body.releaseDate,
    numberInStock: req.body.numberInStock,
    cast: req.body.cast,
  });

  await req.movie.save();
  res.json(req.movie);
});

// Delete a movie
router.delete("/:id", auth, validateId, findMovie, async (req, res) => {
  await req.movie.remove();
  res.send("Movie deleted");
});

module.exports = router;
