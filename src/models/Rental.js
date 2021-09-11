const mongoose = require("mongoose");
const Joi = require("joi");
// const moment = require("moment");

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
  rentalFee: {
    type: Number,
    min: 0,
  },
});

// rentalSchema.statics.lookup = function (customerId, movieId) {
//   return this.findOne({
//     "customer._id": customerId,
//     "movie._id": movieId,
//   });
// };

// rentalSchema.methods.return = function () {
//   this.dateReturned = new Date();

//   const rentalDays = moment().diff(this.dateOut, "days");
//   this.rentalFee = rentalDays * this.movie.dailyRentalRate;
// };

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
    date: Joi.date(),
    returnDate: Joi.date(),
    rentalFee: Joi.number().min(0).required(),
  });

  return schema.validate(rental);
}

module.exports = {
  Rental,
  validate: validateRental,
};
