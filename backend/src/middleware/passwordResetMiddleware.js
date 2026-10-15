const jwt = require("jsonwebtoken");

const passwordResetMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") || [];
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ message: "Password-reset token required" });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.purpose !== "password_reset"
    ) {
      return res.status(403).json({
        message: "A valid password-reset token is required",
      });
    }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = passwordResetMiddleware;
