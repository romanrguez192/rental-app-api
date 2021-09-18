const express = require("express");
const { Actor } = require("../models/Actor");
const find = require("../middlewares/find");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const isStudio = require("../middlewares/isStudio");
const validate = require("../middlewares/validate");

const findActor = find("actor");
const validateActor = validate("actor");
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
router.post("/", auth, isStudio, validateActor, async (req, res) => {
  const actor = new Actor(req.body);
  await actor.save();

  res.status(201).json(actor);
});

// Update an actor
router.put("/:id", auth, isStudio, validateId, findActor, validateActor, async (req, res) => {
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
