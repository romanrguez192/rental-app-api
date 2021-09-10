const mongoose = require("mongoose");
const Joi = require("joi");

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
  },
});

const Studio = mongoose.model("Studio", studioSchema);

const validateStudio = (studio) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(studio);
};

module.exports = {
  Studio,
  validate: validateStudio,
};
