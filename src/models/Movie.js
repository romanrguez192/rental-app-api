const mongoose = require("mongoose");
const Joi = require("joi");

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
    max: 255,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

const validateMovie = (movie) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(255).required(),
    genreId: Joi.objectId().required(),
    studioId: Joi.objectId().required(),
    releaseDate: Joi.date().required(),
    numberInStock: Joi.number().min(0).required(),
  });

  return schema.validate(movie);
};

module.exports = {
  Movie,
  validate: validateMovie,
};
