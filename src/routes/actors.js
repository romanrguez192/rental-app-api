const express = require("express");
const { Actor, validate } = require("../models/Actor");
const findActor = require("../middlewares/findActor");
const validateObjectId = require("../middlewares/validateObjectId");

const validateId = validateObjectId("actor");
const router = express.Router();

// Get all actors
router.get("/", async (req, res) => {
  const actors = await Actor.find().sort("name");
  res.json(actors);
});

// Get one actor
router.get("/:id", validateId, findActor, async (req, res) => {
  res.json(req.actor);
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
router.put("/:id", validateId, findActor, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.actor.name = req.body.name;
  await req.actor.save();

  res.json(req.actor);
});

// Delete a actor
router.delete("/:id", validateId, findActor, async (req, res) => {
  await req.actor.remove();
  res.send("Actor deleted");
});

module.exports = router;
