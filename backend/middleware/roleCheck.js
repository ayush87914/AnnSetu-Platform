// Check specific role(s)
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. This action is only for: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};