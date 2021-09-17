const express = require("express");
const { Movie, validate } = require("../models/Movie");
const { Genre } = require("../models/Genre");
const { Studio } = require("../models/Studio");
const validateId = require("../middlewares/validateObjectId");
const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  const movies = await Movie.find().select("-cast -__v").sort("title").populate("genre").populate("studio");
  res.json(movies);
});

// Get one movie
router.get("/:id", validateId, async (req, res) => {
  // TODO: Verify populate
  const movie = await Movie.findById(req.params.id)
    .select("-__v")
    .populate("genre")
    .populate("studio")
    .populate("cast");

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found");
  }

  res.json(movie);
});

// Create a movie
router.post("/", async (req, res) => {
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
router.put("/:id", validateId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: req.body.genreId,
      studio: req.body.studioId,
      releaseDate: req.body.releaseDate,
      numberInStock: req.body.numberInStock,
      cast: req.body.cast,
    },
    { new: true }
  );

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found");
  }

  res.json(movie);
});

// Delete a movie
router.delete("/:id", validateId, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found");
  }

  res.send("Movie deleted");
});

module.exports = router;
