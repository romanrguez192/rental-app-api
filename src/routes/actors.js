const express = require("express");
const { Actor, validate } = require("../models/Actor");
const validateId = require("../middlewares/validateObjectId");
const router = express.Router();

// Param middleware
router.param("id", validateId, async (req, res, next, id) => {
  const actor = await Actor.findById(id);
  if (!actor) {
    return res.status(404).send("The actor with the given ID was not found");
  }

  res.actor = actor;
  next();
});

// Get all actors
router.get("/", async (req, res) => {
  const actors = await Actor.find().sort("name");
  res.json(actors);
});

// Get one actor
router.get("/:id", validateId, async (req, res) => {
  res.json(actor);
});

// Create a actor
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const actor = new Actor({ name: req.body.name });
  await actor.save();

  res.status(201).json(actor);
});

// Update a actor
router.put("/:id", validateId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const actor = await Actor.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!actor) {
    return res.status(404).send("The actor with the given ID was not found");
  }

  res.json(actor);
});

// Delete a actor
router.delete("/:id", validateId, async (req, res) => {
  const actor = await Actor.findByIdAndRemove(req.params.id);

  if (!actor) {
    return res.status(404).send("The actor with the given ID was not found");
  }

  res.send("Actor deleted");
});

module.exports = router;
