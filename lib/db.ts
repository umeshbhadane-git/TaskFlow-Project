import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

function getMongoURI(): string {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  return MONGODB_URI;
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  await mongoose.connect(getMongoURI());
}