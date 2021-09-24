const jwt = require("jsonwebtoken");
const config = require("config");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Access denied, no token was provided");
  }

  try {
    const jwtSecretKey = config.get("jwtSecretKey");
    const payload = jwt.verify(token, jwtSecretKey);

    req.user = { _id: payload.userId, role: payload.role };

    if (req.user.role === "Customer") {
      req.user.customer = { _id: payload.customerId };
    } else {
      req.user.studio = { _id: payload.studioId };
    }

    next();
  } catch (error) {
    res.status(401).send("Access denied, invalid token");
  }
};

module.exports = auth;
