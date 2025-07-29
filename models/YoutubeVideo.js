import mongoose from 'mongoose';

const youtubeVideoSchema = new mongoose.Schema({
  keyvalue: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const YoutubeVideo = mongoose.model('YoutubeVideo', youtubeVideoSchema);

export default YoutubeVideo;
