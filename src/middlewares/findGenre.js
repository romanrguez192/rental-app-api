const { Genre } = require("../models/Genre");

// Finds the genre with the given id and puts it in the request object
const findGenre = async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found");
  }

  req.genre = genre;
  next();
};

module.exports = findGenre;
