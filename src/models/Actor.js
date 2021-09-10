const mongoose = require("mongoose");
const Joi = require("joi");

const actorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 60,
  },
});

const Actor = mongoose.model("Actor", actorSchema);

const validateActor = (actor) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(actor);
};

module.exports = {
  Actor,
  validate: validateActor,
};
