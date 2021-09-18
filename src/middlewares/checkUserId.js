const checkUserId = (req, res, next) => {
  if (req.user._id !== req.params.id) {
    return res.status(403).send("Access denied");
  }

  next();
};

module.exports = checkUserId;
