const checkStudioId = (req, res, next) => {
  if (req.user.studio._id !== req.params.id) {
    return res.status(403).send("Access denied, unauthorized studio");
  }

  next();
};

module.exports = checkStudioId;
