/**
 * Local development seed — TEMPORARY UTILITY.
 *
 * Populates a *local* development database only, so every screen in the portal
 * has real rows to render. It never touches the production Atlas cluster.
 *
 *   node _seed-dev.mjs
 *
 * Reads MONGO_URI (defaults to the local instance) and ADMIN_EMAIL from .env.
 */
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/dialer";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@dialer.test";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

/*
 * SAFETY GUARD.
 *
 * backend/.env still holds the production Atlas connection string. If this
 * script ever ran with that value it would upsert sample companies straight
 * into live data. Refuse anything that is not an explicitly local host.
 */
const isLocalUri = /^mongodb:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(
  MONGO_URI,
);

if (!isLocalUri) {
  console.error("Refusing to seed: MONGO_URI does not point at a local database.");
  console.error(
    "This script only ever writes to a local development instance. Run it with e.g.",
  );
  console.error(
    "  $env:MONGO_URI='mongodb://127.0.0.1:27017/dialer'; node _seed-dev.mjs",
  );
  process.exit(1);
}

const PERMISSIONS = [
  ["company.read", "View companies"],
  ["company.create", "Add companies"],
  ["company.update", "Edit companies"],
  ["company.delete", "Delete companies"],
  ["user.read", "View users"],
  ["user.create", "Add users"],
  ["user.update", "Edit users"],
  ["user.delete", "Delete users"],
  ["role.read", "View roles"],
  ["role.create", "Add roles"],
  ["role.update", "Edit roles and permissions"],
  ["role.delete", "Delete roles"],
  ["permission.read", "View permissions"],
  ["permission.create", "Add permissions"],
  ["permission.delete", "Delete permissions"],
  ["audit.read", "Read the audit trail"],
];

const now = new Date();
const daysFromNow = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
};

const client = new MongoClient(MONGO_URI);

try {
  await client.connect();
  const db = client.db();
  console.log(`Connected to ${db.databaseName}`);

  /* ---------------- Permissions ---------------- */
  for (const [key, description] of PERMISSIONS) {
    await db.collection("permissions").updateOne(
      { key },
      {
        $set: { key, description, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  const permissionDocs = await db.collection("permissions").find().toArray();
  const permissionIdByKey = new Map(permissionDocs.map((p) => [p.key, p._id]));
  console.log(`permissions: ${permissionDocs.length}`);

  /* ---------------- Roles ---------------- */
  const allPermissionIds = permissionDocs.map((p) => p._id);
  const readOnlyKeys = [
    "company.read",
    "user.read",
    "role.read",
    "permission.read",
    "audit.read",
  ];

  const roles = [
    {
      name: "admin",
      description: "Full access to every module",
      permissions: allPermissionIds,
    },
    {
      name: "manager",
      description: "Read access plus company editing",
      permissions: [
        ...readOnlyKeys.map((k) => permissionIdByKey.get(k)),
        permissionIdByKey.get("company.update"),
      ].filter(Boolean),
    },
  ];

  for (const role of roles) {
    await db.collection("roles").updateOne(
      { name: role.name },
      {
        $set: { ...role, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  const roleDocs = await db.collection("roles").find().toArray();
  const roleIdByName = new Map(roleDocs.map((r) => [r.name, r._id]));
  console.log(`roles: ${roleDocs.map((r) => r.name).join(", ")}`);

  /* ---------------- Users ---------------- */
  const users = [
    {
      name: "Ahmed Arslan",
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      role: roleIdByName.get("admin"),
      status: "active",
    },
    {
      name: "Sara Malik",
      email: "manager@dialer.test",
      password: "Manager@12345",
      role: roleIdByName.get("manager"),
      status: "active",
    },
  ];

  for (const user of users) {
    const existing = await db
      .collection("users")
      .findOne({ email: user.email });

    const hash = await bcrypt.hash(user.password, 10);

    if (existing) {
      await db
        .collection("users")
        .updateOne(
          { _id: existing._id },
          { $set: { role: user.role, status: user.status, updatedAt: now } },
        );
    } else {
      await db.collection("users").insertOne({
        ...user,
        password: hash,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  const userDocs = await db.collection("users").find().toArray();
  const adminUser = userDocs.find((u) => u.email === ADMIN_EMAIL.toLowerCase());
  console.log(`users: ${userDocs.map((u) => u.email).join(", ")}`);

  /* ---------------- Sample companies (LOCAL DEV ONLY) ---------------- */
  const companySeeds = [
    {
      intId: 1001,
      companyName: "Northgate Contact Services",
      joiningDate: daysFromNow(-420),
      dialerLink: "https://dialer.northgate.example.com",
      password: "ng-7f2k91",
      noOfServers: 12,
      serverCharges: 2400,
      paidAmount: 2400,
      renewalDate: daysFromNow(2),
      status: "active",
      comment: "Annual contract, renews quarterly",
      additionalComment: "Primary escalation contact: ops@northgate.example.com",
    },
    {
      intId: 1002,
      companyName: "Vertex Outbound",
      joiningDate: daysFromNow(-260),
      dialerLink: "https://pbx.vertexoutbound.example.com",
      password: "vx-3m8q44",
      noOfServers: 8,
      serverCharges: 1600,
      paidAmount: 800,
      renewalDate: daysFromNow(4),
      status: "active",
      comment: "Half payment received, balance invoiced",
      additionalComment: "Awaiting PO for the remaining balance",
    },
    {
      intId: 1003,
      companyName: "Harbourline Telesales",
      joiningDate: daysFromNow(-95),
      dialerLink: "https://dial.harbourline.example.com",
      password: "hb-9t1x07",
      noOfServers: 20,
      serverCharges: 4000,
      paidAmount: 0,
      renewalDate: daysFromNow(11),
      status: "active",
      comment: "Expanding from 20 to 26 servers next month",
      additionalComment: "",
    },
    {
      intId: 1004,
      companyName: "Cobalt Response Group",
      joiningDate: daysFromNow(-640),
      dialerLink: "https://cobalt.example.com/dialer",
      password: "cb-5r6w22",
      noOfServers: 4,
      serverCharges: 800,
      paidAmount: 800,
      renewalDate: daysFromNow(26),
      status: "active",
      comment: "Stable account",
      additionalComment: "",
    },
    {
      intId: 1005,
      companyName: "Ridgeway Campaigns",
      joiningDate: daysFromNow(-800),
      dialerLink: "https://ridgeway.example.com/dialer",
      password: "rw-2c4v88",
      noOfServers: 6,
      serverCharges: 1200,
      paidAmount: 0,
      renewalDate: daysFromNow(-6),
      status: "inactive",
      inactiveDate: daysFromNow(-6),
      comment: "Account closed, servers decommissioned",
      additionalComment: "Data retained for 90 days",
    },
  ];

  for (const company of companySeeds) {
    await db.collection("companies").updateOne(
      { intId: company.intId },
      {
        $set: {
          ...company,
          createdBy: adminUser._id,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  const companyDocs = await db.collection("companies").find().toArray();
  console.log(`companies: ${companyDocs.length}`);

  /* ---------------- Audit trail ---------------- */
  await db.collection("auditlogs").deleteMany({ entityType: "Company" });

  const northgate = companyDocs.find((c) => c.intId === 1001);
  const vertex = companyDocs.find((c) => c.intId === 1002);
  const harbour = companyDocs.find((c) => c.intId === 1003);

  const auditSeeds = [
    [northgate, "serverCharges", 2200, 2400, 26],
    [northgate, "noOfServers", 10, 12, 26],
    [northgate, "paidAmount", 0, 2400, 12],
    [vertex, "paidAmount", 0, 800, 5],
    [vertex, "comment", "Invoice sent", "Half payment received, balance invoiced", 5],
    [harbour, "noOfServers", 18, 20, 41],
    [harbour, "dialerLink", "https://dialer.harbourline.example.com", "https://dial.harbourline.example.com", 41],
  ];

  await db.collection("auditlogs").insertMany(
    auditSeeds.map(([company, field, oldValue, newValue, hoursAgo]) => ({
      entityType: "Company",
      entityId: company._id,
      field,
      oldValue,
      newValue,
      action: "update",
      changedBy: adminUser._id,
      createdAt: new Date(now.getTime() - hoursAgo * 3600_000),
    })),
  );
  console.log(`audit logs: ${auditSeeds.length}`);

  console.log("");
  console.log("SIGN IN WITH");
  console.log(`  admin   : ${ADMIN_EMAIL.toLowerCase()} / ${ADMIN_PASSWORD}`);
  console.log("  manager : manager@dialer.test / Manager@12345");
} finally {
  await client.close();
}
