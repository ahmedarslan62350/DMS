import { Response, NextFunction } from "express";

export const authorize = (requiredPermission: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: "Forbidden - You don't have permission",
      });
    }

    next();
  };
};
