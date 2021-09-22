const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
    trim: true,
  },
  user: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      email: String,
    },
    required: true,
  },
});

studioSchema.methods.generateAuthToken = function () {
  const jwtSecretKey = config.get("jwtSecretKey");
  const token = jwt.sign({ userId: this.user._id, studioId: this._id, role: "Studio" }, jwtSecretKey);
  return token;
};

const Studio = mongoose.model("Studio", studioSchema);

const validateStudio = (studio) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(60).required(),
  });

  return schema.validate(studio);
};

module.exports = {
  Studio,
  validateStudio,
};
