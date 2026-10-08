import { NextFunction, Request, Response } from "express";

const normaliseIp = (ip: string) => ip.trim().replace(/^::ffff:/, "");

const parseAllowedIps = () => {
  const raw = process.env.ALLOWED_IPS ?? "127.0.0.1,::1";

  // Console log to verify what is actually being loaded when this runs!
  console.log("[IP Whitelist] Loading ALLOWED_IPS:", raw);

  return new Set(
    raw
      .split(",")
      .map((ip) => normaliseIp(ip).replace(/^["']|["']$/g, ""))
      .filter(Boolean),
  );
};

let allowedIps: Set<string> | null = null;

export const ipWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!allowedIps) {
    allowedIps = parseAllowedIps();
  }

  const clientIp = normaliseIp(req.ip ?? "");

  if (!clientIp || !allowedIps.has(clientIp)) {
    console.warn(`Blocked request from non-allow-listed IP: ${req.ip} (Normalized: ${clientIp})`);
    return res.status(403).json({
      message: "Access denied from this IP",
    });
  }

  next();
};