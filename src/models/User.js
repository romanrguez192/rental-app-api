const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  role: {
    type: String,
    enum: ["Customer", "Studio"],
    required: true,
  },
});

userSchema.methods.generateAuthToken = function () {
  const jwtSecretKey = process.env.TOKEN_SECRET;
  const token = jwt.sign({ _id: this._id, role: this.role }, jwtSecretKey);
  return token;
};

const User = mongoose.model("User", userSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
};

module.exports = {
  User,
  validate: validateUser,
};
