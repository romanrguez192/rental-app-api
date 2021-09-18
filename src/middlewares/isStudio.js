const isStudio = (req, res, next) => {
  if (req.user.role !== "Studio") {
    return res.status(403).send("Access denied");
  }

  next();
};

module.exports = isStudio;
