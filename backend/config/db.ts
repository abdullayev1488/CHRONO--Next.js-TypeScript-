import mongoose from "mongoose";
import { getEnv } from "./env";

interface MongooseCache {
  promise: Promise<typeof mongoose> | null;
}

// Dev-də hot reload zamanı bağlantı təkrar açılmasın deyə global-da saxlanılır
const globalCache = globalThis as typeof globalThis & { __mongoose?: MongooseCache };
const cache: MongooseCache = (globalCache.__mongoose ??= { promise: null });

export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) return mongoose;

  cache.promise ??= mongoose.connect(getEnv().mongoUri, { bufferCommands: false });

  try {
    return await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
};
