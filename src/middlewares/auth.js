const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Access denied, no token was provided");
  }

  try {
    const jwtSecretKey = process.env.TOKEN_SECRET;
    const user = jwt.verify(token, jwtSecretKey);
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

module.exports = auth;
