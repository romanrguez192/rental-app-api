const mongoose = require("mongoose");
const config = require("config");

// MongoDB connection
const dbString = config.get("db");
mongoose.connect(dbString);

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

module.exports = db;
