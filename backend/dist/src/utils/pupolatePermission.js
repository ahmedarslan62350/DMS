import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const permissionsData = [
    { key: "user.create", description: "Create a new user" },
    { key: "user.read", description: "Read user data" },
    { key: "user.update", description: "Update user data" },
    { key: "user.delete", description: "Delete user" },
    { key: "company.create", description: "Create a company" },
    { key: "company.read", description: "Read company data" },
    { key: "company.update", description: "Update company data" },
    { key: "company.delete", description: "Delete company" },
    { key: "role.create", description: "Create roles" },
    { key: "role.read", description: "Read roles" },
    { key: "role.update", description: "Update roles" },
    { key: "role.delete", description: "Delete roles" },
    { key: "permission.create", description: "Create permissions" },
    { key: "permission.read", description: "Read permissions" },
    { key: "permission.update", description: "Update permissions" },
    { key: "permission.delete", description: "Delete permissions" },
    { key: "audit.read", description: "Read audits" },
];
const rolesData = [
    {
        name: "admin",
        description: "This Users have all the access and permissions",
        permissions: [
            "user.create",
            "user.read",
            "user.update",
            "user.delete",
            "company.create",
            "company.read",
            "company.update",
            "company.delete",
            "role.create",
            "role.read",
            "role.update",
            "role.delete",
            "permission.create",
            "permission.read",
            "permission.update",
            "permission.delete",
            "audit.read",
        ],
    },
    {
        name: "manager",
        description: "This Users can manage",
        permissions: [
            "company.read",
            "company.update",
            "comment.create",
            "comment.read",
            "audit.read",
        ],
    },
    {
        name: "viewer",
        description: "This Users only have permission to read",
        permissions: ["company.read", "comment.read", "audit.read"],
    },
];
const seed = async () => {
    try {
        const { connection } = await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected");
        const Permission = connection.db?.collection("permissions");
        const Role = connection.db?.collection("roles");
        if (!Permission || !Role)
            return;
        for (const perm of permissionsData) {
            const exists = await Permission.findOne({ key: perm.key });
            if (!exists) {
                await Permission.insertOne(perm);
                console.log(`Permission created: ${perm.key}`);
            }
        }
        const allPermissions = await Permission.find();
        const permMap = {};
        allPermissions.forEach((p) => (permMap[p.key] = p._id));
        for (const role of rolesData) {
            const exists = await Role.findOne({ name: role.name });
            if (!exists) {
                const permIds = role.permissions.map((p) => permMap[p]);
                await Role.insertOne({ name: role.name, permissions: permIds });
                console.log(`Role created: ${role.name}`);
            }
        }
        console.log("✅ Seeding completed");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
};
seed();
export default seed;
