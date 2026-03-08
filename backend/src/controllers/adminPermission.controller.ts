import { Response } from "express";
import { Permission } from "../models/Permission.model";

export const createPermission = async (req: any, res: Response) => {
  try {
    const { key, description } = req.body;

    const exists = await Permission.findOne({ key });
    if (exists) {
      return res.status(400).json({ message: "Permission exists" });
    }

    const permission = new Permission({
      key,
      description,
    });

    permission.$locals.userId = req.user.userId;

    await permission.save();

    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getPermissions = async (req: any, res: Response) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: -1 });

    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const deletePermission = async (req: any, res: Response) => {
  try {
    const permission = await Permission.findOneAndDelete(
      { _id: req.params.id },
      { userId: req.user.userId },
    );

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.json({ message: "Permission deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
