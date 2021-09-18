const express = require("express");
const { Actor, validate } = require("../models/Actor");
const findActor = require("../middlewares/findActor");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isStudio = require("../middlewares/isStudio");

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

// Create an actor
router.post("/", auth, isStudio, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const actor = new Actor(req.body);
  await actor.save();

  res.status(201).json(actor);
});

// Update an actor
router.put("/:id", auth, isStudio, validateId, findActor, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  req.actor.set(req.body);
  await req.actor.save();

  res.json(req.actor);
});

// Delete an actor
router.delete("/:id", auth, isStudio, validateId, findActor, async (req, res) => {
  await req.actor.remove();
  res.send("Actor deleted");
});

module.exports = router;
