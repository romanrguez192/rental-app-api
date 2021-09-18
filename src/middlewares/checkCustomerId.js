const checkCustomerId = (req, res, next) => {
  if (req.user.customer._id !== req.params.id) {
    return res.status(403).send("Access denied, unauthorized customer");
  }

  next();
};

module.exports = checkCustomerId;
