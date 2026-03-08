import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv"

dotenv.config()

const ips = process.env.ALLOWED_IPS || "127.0.0.1";
const allowedIPs = new Set(ips.split(",").map((ip) => ip.trim()));

export const ipWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientIP = req.ip;

  if (!allowedIPs.has(clientIP!)) {
    return res.status(403).json({
      message: "Access denied from this IP",
    });
  }

  next();
};
