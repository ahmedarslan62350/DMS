export const authorize = (requiredPermission) => {
    return (req, res, next) => {
        const userPermissions = req.user?.permissions || [];
        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({
                message: "Forbidden - You don't have permission",
            });
        }
        next();
    };
};
