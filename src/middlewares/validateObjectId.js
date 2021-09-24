const mongoose = require("mongoose");

const validateObjectId = (model) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send(`Invalid ${model} ID`);
  }

  next();
};

module.exports = validateObjectId;
