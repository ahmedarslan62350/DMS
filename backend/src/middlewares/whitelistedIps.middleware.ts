import { NextFunction, Request, Response } from "express";

/**
 * Restrict API access to a configured list of client addresses.
 *
 * Fixes over the original:
 *  - surrounding quotes and stray whitespace are stripped, so a value like
 *    `ALLOWED_IPS= "::1,::ffff:127.0.0.1"` is parsed correctly;
 *  - IPv4-mapped IPv6 addresses are normalised, so `127.0.0.1` in the config
 *    matches a client reported as `::ffff:127.0.0.1`;
 *  - the allow-list is no longer dumped to stdout on every single request.
 */
const normaliseIp = (ip: string) => ip.trim().replace(/^::ffff:/, "");

const parseAllowedIps = () => {
  const raw = process.env.ALLOWED_IPS ?? "127.0.0.1,::1";

  return new Set(
    raw
      .split(",")
      .map((ip) => normaliseIp(ip).replace(/^["']|["']$/g, ""))
      .filter(Boolean),
  );
};

const allowedIps = parseAllowedIps();

export const ipWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientIp = normaliseIp(req.ip ?? "");

  if (!clientIp || !allowedIps.has(clientIp)) {
    console.warn(`Blocked request from non-allow-listed IP: ${req.ip}`);
    return res.status(403).json({
      message: "Access denied from this IP",
    });
  }

  next();
};
