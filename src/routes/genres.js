const express = require("express");
const validateGenre = require("../middlewares/validateGenre");
const router = express.Router();

const genres = [];

router.get("/", (req, res) => {
  res.send(genres);
});

router.get("/:id", (req, res) => {
  const genre = {};
  if (!genre) return res.status.apply(404).send("This genre doesn't exist");

  res.send(genre);
});

router.post("/", validateGenre, (req, res) => {
  const genre = {};

  res.send(genre);
});

router.put("/:id", validateGenre, (req, res) => {
  const genre = {};
  if (!genre) return res.status.apply(404).send("This genre doesn't exist");

  res.send(genre);
});

router.delete("/:id", (req, res) => {
  const genre = {};
  if (!genre) return res.status.apply(404).send("This genre doesn't exist");

  res.send("Deleted");
});

module.exports = router;
