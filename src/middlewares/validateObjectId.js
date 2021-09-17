const mongoose = require("mongoose");

const validateObjectId = (model) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send(`Invalid ${model} ID`);
    }

    next();
  };
};

module.exports = validateObjectId;
