const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).send("JSON format was expected");
  }

  res.status(500).send("Something failed");
};

module.exports = errorHandler;
