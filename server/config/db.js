import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `Successfully connected to DB: ${conn.connection.host}`.bgGreen
    );
  } catch (error) {
    console.log(error);
    throw new Error("Error connecting to DB");
  }
};
