import mongoose from "mongoose";

const appealSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const Appeal = mongoose.model("Appeal", appealSchema);
export default Appeal;
