const isCustomer = (req, res, next) => {
  if (req.user.role !== "Customer") {
    return res.status(403).send("Access denied, user is not a customer");
  }

  next();
};

module.exports = isCustomer;
