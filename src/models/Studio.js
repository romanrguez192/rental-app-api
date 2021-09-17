const mongoose = require("mongoose");
const Joi = require("joi");

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

const Studio = mongoose.model("Studio", studioSchema);

const validateStudio = (studio) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(studio);
};

// We need a different validate function for updating because it's not allowed to modify the user of a studio
const validateUpdate = (studio) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(studio);
};

module.exports = {
  Studio,
  validate: validateStudio,
  validateUpdate,
};
