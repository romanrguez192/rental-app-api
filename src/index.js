require("./utils/logger");
require("./config/db");
require("./config/joi");
require("express-async-errors");
const config = require("config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

// App
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Port
const port = config.get("port");

// Server
const server = app.listen(port, () => console.log(`Server listening on port ${port}...`));

module.exports = server;
