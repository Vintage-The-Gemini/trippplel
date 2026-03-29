const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

// Any staff role (viewer, orders_manager, admin, super_admin)
exports.adminOnly = (req, res, next) => {
  const staffRoles = ["viewer", "orders_manager", "admin", "super_admin"];
  if (!staffRoles.includes(req.user?.role)) {
    return res.status(403).json({ message: "Staff access required" });
  }
  next();
};

// admin or super_admin — can manage products, finances
exports.managerOnly = (req, res, next) => {
  if (!["admin", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// super_admin only — can manage users and roles
exports.superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};
