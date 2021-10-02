const mongoose = require("mongoose");
const Joi = require("joi");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  returnDate: {
    type: Date,
  },
});

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = Joi.object({
    customer: Joi.objectId().required(),
    movie: Joi.objectId().required(),
  });

  return schema.validate(rental);
}

module.exports = {
  Rental,
  validate: validateRental,
};
