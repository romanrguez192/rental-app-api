const mongoose = require("mongoose");
const Joi = require("joi");

const actorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
    trim: true,
  },
});

const Actor = mongoose.model("Actor", actorSchema);

const validateActor = (actor) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(5).max(50).required(),
  });

  return schema.validate(actor);
};

module.exports = {
  Actor,
  validateActor,
};
