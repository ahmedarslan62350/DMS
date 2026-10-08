/**
 * Read-only connectivity probe. TEMPORARY — deleted after use.
 * Reads the candidate URI from MONGOURI_TEST so no credential is written to disk.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGOURI_TEST;

if (!uri) {
  console.error("MONGOURI_TEST is not set");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15_000 });

try {
  await client.connect();
  console.log("CONNECT=ok");

  const host = client.options?.hosts?.join(",") ?? "(unknown)";
  console.log("HOSTS=" + host);

  let dbs = [];
  try {
    const listed = await client.db("admin").admin().listDatabases();
    dbs = listed.databases.map((d) => d.name);
    console.log("LIST_DATABASES=ok");
    console.log("DATABASES=" + dbs.join(", "));
  } catch (err) {
    console.log("LIST_DATABASES=denied (" + err.message + ")");
  }

  // Anything the app's models could plausibly be using.
  const candidates = [...new Set([...dbs, "test", "dialer", "dialerflow"])];

  for (const name of candidates) {
    try {
      const db = client.db(name);
      const collections = await db.listCollections().toArray();
      if (collections.length === 0) continue;

      const parts = [];
      for (const col of collections) {
        const count = await db.collection(col.name).estimatedDocumentCount();
        parts.push(`${col.name}=${count}`);
      }
      console.log(`DB ${name} :: ${parts.join("  ")}`);
    } catch (err) {
      console.log(`DB ${name} error: ${err.message}`);
    }
  }
} catch (err) {
  console.log("CONNECT=fail :: " + err.message);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
