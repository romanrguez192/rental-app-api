const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 20,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(10).max(20).required(),
  });

  return schema.validate(customer);
};

module.exports = {
  Customer,
  validate: validateCustomer,
};
