const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

const createToken = (user, secretKey, expiresIn) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    firstname: user.firstname,
    lastname: user.lastname,
  };
  return jwt.sign(payload, secretKey, { expiresIn });
};

module.exports = {
  createAccessToken: (user) => createToken(user, secret, "15m"),
  createRefreshToken: (user) => createToken(user, refreshSecret, "7d"),

  verify: (req, res, next) => {
    let token = req.headers.authorization;
    // console.log("Authorization header:", token);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    token = token.split(" ")[1];

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = decoded;
      next();
    });
  },

  verifyAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  },
};
