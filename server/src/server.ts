import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tejas";

console.log("Attempting to connect to MongoDB...", MONGO_URI);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // process.exit(1); // Don't crash, let server start
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
