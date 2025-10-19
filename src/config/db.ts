import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Database connection failed:", (err as Error).message);
    process.exit(1);
  }
};
