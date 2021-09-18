const checkMovieStudio = (req, res, next) => {
  if (req.movie.studio.toString() !== req.user.studio._id) {
    return res.status(403).send("Access denied, unauthorized to modify this movie");
  }

  next();
};

module.exports = checkMovieStudio;
