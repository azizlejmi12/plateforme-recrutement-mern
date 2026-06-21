const roleMiddleware = (...roles) => {
  return (req, res, next) => {

    // req.user est rempli par authMiddleware avant
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`
      })
    }

    next()  // le rôle est bon, on continue
  }
}

module.exports = roleMiddleware