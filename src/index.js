if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./utils/logger");
require("./config/db");
require("./config/joi");
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

// App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Port
const port = process.env.PORT || 4000;

// Server
app.listen(port, () => console.log(`Server listening on port ${port}...`));
