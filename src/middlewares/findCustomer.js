const { Customer } = require("../models/Customer");

// Finds the customer with the given id and puts it in the request object
const findCustomer = async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found");
  }

  req.customer = customer;
  next();
};

module.exports = findCustomer;
