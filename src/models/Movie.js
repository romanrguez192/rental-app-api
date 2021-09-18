const mongoose = require("mongoose");
const Joi = require("joi");

const castSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Actor",
    required: true,
  },
  characters: {
    type: [String],
    required: true,
  },
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
    required: true,
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Studio",
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 100000,
  },
  cast: {
    type: [castSchema],
    required: true,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

const validateMovie = (movie) => {
  const castSchema = Joi.object({
    actorId: Joi.objectId().required(),
    characters: Joi.array().min(1).items(Joi.string().trim().min(2)).required(),
  });

  const movieSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100000).required(),
    genreId: Joi.objectId().required(),
    releaseDate: Joi.date().min("1900-01-01").required(),
    numberInStock: Joi.number().min(0).required(),
    cast: Joi.array().min(1).items(castSchema).required(),
  });

  return movieSchema.validate(movie);
};

// We need a different validate function for updating because it's not allowed
// to modify the studio or stock of a movie
const validateUpdate = (movie) => {
  const castSchema = Joi.object({
    actorId: Joi.objectId().required(),
    characters: Joi.array().min(1).items(Joi.string()).required(),
  });

  const movieSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100000).required(),
    genreId: Joi.objectId().required(),
    releaseDate: Joi.date().required(),
    cast: Joi.array().min(1).items(castSchema).required(),
  });

  return movieSchema.validate(movie);
};

module.exports = {
  Movie,
  validate: validateMovie,
  validateUpdate,
};
