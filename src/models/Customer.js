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
});

const Customer = mongoose.model("Customer", customerSchema);

const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    phone: Joi.string().trim().min(10).max(20).required(),
  });

  return schema.validate(customer);
};

module.exports = {
  Customer,
  validate: validateCustomer,
};
