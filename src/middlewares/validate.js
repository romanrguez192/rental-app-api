const { validateActor } = require("../models/Actor");
const { validateCustomer } = require("../models/Customer");
const { validateGenre } = require("../models/Genre");
const { validateMovie, validateMovieUpdate } = require("../models/Movie");
const { validateStudio } = require("../models/Studio");
const { validateRental } = require("../models/Rental");
const { validateUser } = require("../models/User");

const validators = {
  create: {
    actor: validateActor,
    customer: validateCustomer,
    genre: validateGenre,
    movie: validateMovie,
    studio: validateStudio,
    rental: validateRental,
    user: validateUser,
  },
  update: {
    actor: validateActor,
    customer: validateCustomer,
    genre: validateGenre,
    movie: validateMovieUpdate,
    studio: validateStudio,
  },
};

const validate = (model) => (req, res, next) => {
  let body = req.body;
  let error;

  if (req.method === "POST") {
    if (["user", "customer", "studio"].includes(model)) {
      body = req.body[model];
    }

    error = validators.create[model](body).error;
  } else {
    error = validators.update[model](body).error;
  }

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  next();
};

module.exports = validate;
