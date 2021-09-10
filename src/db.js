const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

module.exports = db;
