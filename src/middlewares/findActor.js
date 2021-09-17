const { Actor } = require("../models/Actor");

// Finds the actor with the given id and puts it in the request object
const findActor = async (req, res, next) => {
  const actor = await Actor.findById(req.params.id);
  if (!actor) {
    return res.status(404).send("The actor with the given ID was not found");
  }

  req.actor = actor;
  next();
};

module.exports = findActor;
