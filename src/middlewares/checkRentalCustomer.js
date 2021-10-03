const checkRentalCustomer = (req, res, next) => {
  if (req.rental.customer.toString() !== req.user.customer._id) {
    return res.status(403).send("Access denied, unauthorized to view this rental");
  }

  next();
};

module.exports = checkRentalCustomer;
