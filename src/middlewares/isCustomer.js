const isCustomer = (req, res, next) => {
  if (req.user.role !== "Customer") {
    return res.status(403).send("Access denied");
  }

  next();
};

module.exports = isCustomer;
