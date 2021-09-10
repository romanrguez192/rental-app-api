require("dotenv").config();
require("./db");
const express = require("express");
const routes = require("./routes");

// App
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api", routes);

// Port
const port = process.env.PORT || 4000;

// Server
app.listen(port, () => console.log(`Server listening on port ${port}...`));
