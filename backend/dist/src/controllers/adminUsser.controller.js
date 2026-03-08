import { User } from "../models/User.model";
import { Role } from "../models/Role.model";
import { Permission } from "../models/Permission.model";
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const user = new User({
            name,
            email,
            password,
            role,
            status: "active",
        });
        user.$locals.userId = req.user.userId;
        await user.save();
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate([
            {
                model: Role,
                path: "role",
                populate: [
                    {
                        model: Permission,
                        path: "permissions",
                        select: "name -_id",
                        transform: (doc) => {
                            return doc ? doc.get("name") : null;
                        },
                    },
                ],
            },
        ])
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate([
            {
                model: Role,
                path: "role",
                populate: [
                    {
                        model: Permission,
                        path: "permissions",
                        select: "name -_id",
                        transform: (doc) => {
                            return doc ? doc.get("name") : null;
                        },
                    },
                ],
            },
        ])
            .select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, {
            new: true,
            userId: req.user.userId,
        })
            .populate([
            {
                model: Role,
                path: "role",
                populate: [
                    {
                        model: Permission,
                        path: "permissions",
                        select: "name -_id",
                        transform: (doc) => {
                            return doc ? doc.get("name") : null;
                        },
                    },
                ],
            },
        ])
            .select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ _id: req.params.id }, { userId: req.user.userId });
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
