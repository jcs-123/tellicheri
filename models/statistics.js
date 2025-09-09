import mongoose from "mongoose";

const statisticsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rows: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true }
    }
  ]
});

// 👇 Prevents overwriteModelError on hot reload
export default mongoose.models.Statistics || mongoose.model("Statistics", statisticsSchema);
