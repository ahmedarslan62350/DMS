import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://ahmedarslanarslan9_db_user:8PFKS10Yihn4xmfY@cluster0.tvjkven.mongodb.net/test"
)
.then(() => console.log("Connected"))
.catch(err => console.error(err));