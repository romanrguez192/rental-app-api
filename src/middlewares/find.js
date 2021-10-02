const { Actor } = require("../models/Actor");
const { Customer } = require("../models/Customer");
const { Genre } = require("../models/Genre");
const { Movie } = require("../models/Movie");
const { Studio } = require("../models/Studio");
const { Rental } = require("../models/Rental");

const models = {
  actor: Actor,
  customer: Customer,
  genre: Genre,
  movie: Movie,
  studio: Studio,
  rental: Rental,
};

const find = (model) => async (req, res, next) => {
  const document = await models[model].findById(req.params.id);
  if (!document) {
    return res.status(404).send(`The ${model} with the given ID was not found`);
  }

  req[model] = document;
  next();
};

module.exports = find;
