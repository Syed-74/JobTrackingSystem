/**
 * Middleware to restrict route access to specific roles.
 * Must be used after authMiddleware has populated req.user.
 * 
 * @param  {...string} allowedRoles Roles allowed to access the route
 * @returns {Function} Express middleware function
 */
exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to perform this action.'
            });
        }
        next();
    };
};
