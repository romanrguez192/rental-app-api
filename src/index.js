require("dotenv").config();
const logger = require("./utils/logger");
require("./config/db");
require("./config/joi");
const express = require("express");
require("express-async-errors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

// App
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Port
const port = process.env.PORT || 4000;

// Server
app.listen(port, () => console.log(`Server listening on port ${port}...`));
