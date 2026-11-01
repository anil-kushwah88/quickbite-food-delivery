import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

// Accepts both `token: <jwt>` (used by the React apps) and `Authorization: Bearer <jwt>`.
export const getTokenFromRequest = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return req.headers.token || null;
};
