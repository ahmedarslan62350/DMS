import { Request, Response } from "express";
import { Role } from "../models/Role.model";
import { Permission } from "../models/Permission.model";

export const createRole = async (req: any, res: Response) => {
  try {
    const { name, permissions } = req.body;

    const exists = await Role.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = new Role({
      name,
      permissions,
    });

    role.$locals.userId = req.user.userId;

    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    // `Permission` keys on `key`, not `name` — the previous projection asked
    // for a field that does not exist and returned permissions with no label.
    const roles = await Role.find()
      .populate("permissions", "key description")
      .sort({ createdAt: -1 });

    res.json(roles);
  } catch (error) {
    res.status(500).json({ error });
  }
};


export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id).populate(
      "permissions",
      "key description"
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateRole = async (req: any, res: Response) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      {
        new: true,
        userId: req.user.userId,
      }
    ).populate("permissions", "key description");

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const deleteRole = async (req: any, res: Response) => {
  try {
    const role = await Role.findOneAndDelete(
      { _id: req.params.id },
      { userId: req.user.userId }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error });
  }
};