import jwt from "jsonwebtoken";

// Runs BEFORE protected routes. Blocks anyone without a valid token.
export function requireAuth(req, res, next) {
  // The frontend sends the token as: "Authorization: Bearer <token>"
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized — no token" });
  }

  try {
    // Verify the signature + expiry using our secret.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;   // every handler after this can trust req.userId
    next();                        // let the request continue to the route
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}