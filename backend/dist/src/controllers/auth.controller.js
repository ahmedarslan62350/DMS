import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { Role } from "../models/Role.model";
import { Permission } from "../models/Permission.model";
export const register = async (req, res) => {
    try {
        if (!process.env.ISREG_ENABLED) {
            res.status(400).json({ message: "Unable to register", success: false });
            return;
        }
        const { name, email, password } = req.body;
        if (!email || !name || !password) {
            res
                .status(404)
                .json({ message: "All the fields are required", success: false });
        }
        if (email !== process.env.ADMIN_EMAIL) {
            console.log("email not equal");
            res.status(400).json({ message: "Unable to register", success: false });
            return;
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }
        const role = await Role.findOne({ name: "admin" });
        if (!role) {
            res.status(400).json({ message: "Unable to register", success: false });
            return;
        }
        const user = new User({
            name,
            email,
            password,
            role: role._id,
        });
        user.$locals.userId = user._id;
        user.save();
        res.json({ message: "User registered", user });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
            .select("+password")
            .populate([
            {
                model: Role,
                path: "role",
                populate: [
                    {
                        model: Permission,
                        path: "permissions",
                        select: "key -_id",
                        transform: (doc) => {
                            return doc ? doc.get("key") : null;
                        },
                    },
                ],
            },
        ]);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({
            userId: user._id,
            role: user.role.name,
            permissions: user.role.permissions,
        }, process.env.JWT_SECRET, { expiresIn: "12h" });
        res.json({
            token,
            user,
        });
    }
    catch (err) {
        console.log("Error while logging in", err);
        res.status(500).json({ error: err });
    }
};
export const me = async (req, res) => {
    if (!req.user) {
        res.status(400).send({ message: "Unauthorized" });
        return;
    }
    const user = await User.findById(req.user.userId).populate("role", "name");
    if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
    }
    return res.status(200).send({ user });
};
