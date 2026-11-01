import ApiError from "../utils/ApiError.js";
import { getTokenFromRequest, verifyToken } from "../utils/token.js";

const decode = (req) => {
  const token = getTokenFromRequest(req);
  if (!token) throw new ApiError(401, "Not authorized, please login again");
  try {
    return verifyToken(token);
  } catch {
    throw new ApiError(401, "Session expired, please login again");
  }
};

// Customer routes: attaches req.userId
export const requireUser = (req, _res, next) => {
  try {
    const payload = decode(req);
    if (payload.role !== "user" || !payload.id) throw new ApiError(401, "Not authorized");
    req.userId = payload.id;
    next();
  } catch (err) {
    next(err);
  }
};

// Admin panel routes
export const requireAdmin = (req, _res, next) => {
  try {
    const payload = decode(req);
    if (payload.role !== "admin") throw new ApiError(403, "Admin access required");
    req.admin = payload;
    next();
  } catch (err) {
    next(err);
  }
};
