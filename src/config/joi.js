const Joi = require("joi");
joiObjectId = require("joi-objectid");

Joi.objectId = joiObjectId(Joi);
