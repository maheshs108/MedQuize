import mongoose from "mongoose";

// Fix for querySrv ECONNREFUSED on some networks (e.g. Windows/Node 22): use explicit DNS
function setDnsServers() {
  try {
    const dns = require("node:dns");
    if (dns && typeof dns.setServers === "function") {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    }
  } catch (_) {
    // ignore
  }
}

// Support MONGODB_URI (full string), MONGODB_DIRECT_URI (no SRV), or MONGODB_URL + DB
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;
  const direct = process.env.MONGODB_DIRECT_URI;
  if (direct) return direct;
  const url = process.env.MONGODB_URL;
  if (!url) {
    throw new Error(
      "Set MONGODB_URI or MONGODB_URL in .env.local (MongoDB Atlas connection string)"
    );
  }
  const db = process.env.DB || "MedQuize";
  const base = url.replace(/\?.*$/, "").replace(/\/?$/, "");
  const params = url.includes("?") ? "?" + url.split("?")[1] : "?retryWrites=true&w=majority";
  return `${base}/${db}${params}`;
}

const MONGODB_URI = getMongoUri();

interface GlobalWithMongoose {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const globalForDb = global as GlobalWithMongoose;

export async function connectDb(): Promise<typeof mongoose> {
  if (globalForDb.mongoose?.conn) return globalForDb.mongoose.conn;
  setDnsServers();
  const promise = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  globalForDb.mongoose = { conn: null, promise };
  globalForDb.mongoose.conn = await promise;
  return globalForDb.mongoose.conn;
}
