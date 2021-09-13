const winston = require("winston");

const errorHandler = (err, req, res, next) => {
  winston.error(err.message, err);

  res.status(500).send("Something failed");
};

module.exports = errorHandler;
