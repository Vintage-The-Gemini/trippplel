const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

exports.protect = async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = { ...user, _id: user.id };
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!["staff", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Staff access required" });
  }
  next();
};

exports.requirePermission = (permission) => (req, res, next) => {
  if (req.user?.role === "super_admin") return next();
  if (req.user?.permissions?.includes(permission)) return next();
  return res.status(403).json({ message: `Requires '${permission}' permission` });
};

exports.superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};
