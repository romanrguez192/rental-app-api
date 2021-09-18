const isStudio = (req, res, next) => {
  if (req.user.role !== "Studio") {
    return res.status(403).send("Access denied, user is not a studio");
  }

  next();
};

module.exports = isStudio;
