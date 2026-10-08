import mongoose from "mongoose";

const STATES = [
  "disconnected",
  "connected",
  "connecting",
  "disconnecting",
] as const;

export interface DbStatus {
  connected: boolean;
  state: string;
  name?: string;
}

/** Single source of truth for "is the data layer usable right now?". */
export const getDbStatus = (): DbStatus => {
  const readyState = mongoose.connection.readyState;

  return {
    connected: readyState === 1,
    state: STATES[readyState] ?? "unknown",
    // Always present so the JSON contract never drops the key when the
    // connection has no database selected yet.
    name: mongoose.connection.name || "",
  };
};
