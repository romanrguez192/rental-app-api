const { Movie } = require("../models/Movie");

// Finds the movie with the given id and puts it in the request object
const findMovie = async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status(404).send("The movie with the given ID was not found");
  }

  req.movie = movie;
  next();
};

module.exports = findMovie;
