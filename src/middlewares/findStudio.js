const { Studio } = require("../models/Studio");

// Finds the studio with the given id and puts it in the request object
const findStudio = async (req, res, next) => {
  const studio = await Studio.findById(req.params.id);
  if (!studio) {
    return res.status(404).send("The studio with the given ID was not found");
  }

  req.studio = studio;
  next();
};

module.exports = findStudio;
