
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("kindora");
    await db.command({ ping: 1 });
    console.log("MongoDB connected successfully!");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected yet!");
  }
  return db;
};

module.exports = { connectDB, getDB };
