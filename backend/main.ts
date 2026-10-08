import app from "./src/app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

const RETRY_BASE_MS = 3_000;
const RETRY_MAX_MS = 30_000;

let attempt = 0;
let retryTimer: NodeJS.Timeout | null = null;
let announcedDown = false;

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function scheduleRetry() {
  if (retryTimer || !MONGO_URI) return;

  const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * Math.max(1, attempt));
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void connectWithRetry();
  }, delay);

  // Don't hold the event loop open just for a reconnect attempt.
  retryTimer.unref?.();
}

async function connectWithRetry() {
  if (!MONGO_URI) {
    console.error(
      "❌ MONGO_URI is not set. The API will start but every data route returns 503.",
    );
    console.error("   Add MONGO_URI to backend/.env and restart to enable data access.");
    return;
  }

  attempt += 1;

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8_000 });
    attempt = 0;
    announcedDown = false;
    console.log("✅ MongoDB connected");
  } catch (error) {
    /*
     * Back off quietly. Repeating the full failure on every attempt floods the
     * log for a condition that is usually a stale credential rather than
     * something transient, so only the first few and then every fifth are told.
     */
    const shouldLog = attempt <= 3 || attempt % 5 === 0;

    if (shouldLog) {
      console.error(
        `❌ MongoDB connection failed (attempt ${attempt}): ${describeError(error)}`,
      );

      if (attempt === 1) {
        console.error(
          "   The API stays up and /api/health still answers; data routes return 503.",
        );
        console.error(
          "   Update MONGO_URI in backend/.env with a working connection string.",
        );
      }
    }

    scheduleRetry();
  }
}

/* Recover automatically if the connection drops after a successful start. */
mongoose.connection.on("disconnected", () => {
  if (!announcedDown) {
    announcedDown = true;
    console.warn("⚠️  MongoDB disconnected — data routes now return 503.");
  }
  if (attempt === 0) scheduleRetry();
});

mongoose.connection.on("error", () => {
  // Surfaced by connectWithRetry's own reporting; swallow to avoid noise.
});

/*
 * Bind the port first, unconditionally.
 *
 * The old entrypoint awaited the database before `app.listen`, so a bad
 * connection string meant no server at all — the frontend just saw a dead
 * port. Now the API is always reachable, `/api/health` always answers, and
 * data routes fail with an explicit 503 until MongoDB is up.
 */
const server = app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

void connectWithRetry();

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down.`);

  if (retryTimer) clearTimeout(retryTimer);

  server.close(() => {
    void mongoose.connection.close(false).finally(() => process.exit(0));
  });

  // Hard stop if graceful shutdown stalls.
  setTimeout(() => process.exit(0), 5_000).unref();
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
