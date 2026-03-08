import app from "./src/app";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;
try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
catch (err) {
    console.error("❌ DB Connection Error:", err);
}
