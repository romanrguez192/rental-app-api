const bcrypt = require("bcryptjs");
const { User } = require("../models/User");

const signup = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.user.email });
  if (user) {
    return res.status(400).send("This user is already registered");
  }

  const password = await bcrypt.hash(req.body.user.password, 10);
  req.user = new User({ email: req.body.user.email, password });
  next();
};

module.exports = signup;
