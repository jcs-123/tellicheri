import mongoose from "mongoose";

const rowSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const statisticSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rows: [rowSchema],
  createdAt: { type: Date, default: Date.now }
});

const Statistic = mongoose.model("Statistic", statisticSchema);
export default Statistic;
