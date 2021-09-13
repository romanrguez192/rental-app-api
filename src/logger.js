const winston = require("winston");

winston.add(new winston.transports.File({ filename: "logging.log" }));

winston.add(
  new winston.transports.File({
    filename: "exceptions.log",
    handleExceptions: true,
  })
);

winston.add(
  new winston.transports.File({
    filename: "rejections.log",
    handleRejections: true,
  })
);
