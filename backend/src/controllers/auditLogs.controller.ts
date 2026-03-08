import { Request, Response } from "express";
import { AuditLog } from "../models/AuditLog.model";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate([
        { path: "entityId" },
        { path: "changedBy", select: "name email" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error });
  }
};

export const getAuditLogsByEntity = async (req: Request, res: Response) => {
  try {
    const { entityType } = req.params;

    const logs = await AuditLog.find({ entityType })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getEntityAuditLogs = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await AuditLog.find({
      entityType,
      entityId,
    })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error });
  }
};
