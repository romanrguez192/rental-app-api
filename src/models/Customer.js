const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 20,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    phone: Joi.string().trim().min(10).max(20).required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(customer);
};

// We need a different validate function for updating because it's not allowed to modify the user of a customer
const validateUpdate = (customer) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    phone: Joi.string().trim().min(10).max(20).required(),
  });

  return schema.validate(customer);
};

module.exports = {
  Customer,
  validate: validateCustomer,
  validateUpdate,
};
