// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import youtubeRoutes from './routes/youtube.js';
import homeVideoRoutes from './routes/homeVideoRoutes.js';
import programmeDiaryRoutes from './routes/programmeDiary.js';
import websiteLinksRoutes from './routes/websiteLinks.js';
import newsRoutes from './routes/news.js';
import authRoutes from './routes/authRoutes.js';
import bulletinRoutes from './routes/bulletins.js';
import downloadRoutes from './routes/downloadRoutes.js';
import circularRoutes from './routes/circularRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import statisticsRoutes from './routes/statistics.js';
import importRoutes from './routes/import/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for JSON data
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Serve uploaded videos statically
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// API Routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/home-video', homeVideoRoutes);
app.use('/api/programme-diary', programmeDiaryRoutes);
app.use('/api/website-links', websiteLinksRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/import', importRoutes);
app.use('/api/statistics', statisticsRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});


// // server.js
// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import path from 'path';

// // Import routes
// import youtubeRoutes from './routes/youtube.js';
// import homeVideoRoutes from './routes/homeVideoRoutes.js';
// import programmeDiaryRoutes from './routes/programmeDiary.js';
// import websiteLinksRoutes from './routes/websiteLinks.js';
// import newsRoutes from './routes/news.js';
// import authRoutes from './routes/authRoutes.js';
// import bulletinRoutes from './routes/bulletins.js';
// import downloadRoutes from './routes/downloadRoutes.js';
// import circularRoutes from './routes/circularRoutes.js';
// import galleryRoutes from './routes/galleryRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import logRoutes from './routes/logRoutes.js';
// // import importRoutes from './routes/importRoutes.js';
// import administrationRoutes from './routes/administration.js';
// import parishroute from './routes/parish.js';
// import uploadImageRoute from './routes/uploadImage.js';
// // import parishesRoute from './routes/parishes.js';
// import statisticsRoutes from './routes/statistics.js';
// import pastoralCouncilRoutes from './routes/pastoralCouncil.js';

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // -------------------
// // MongoDB Connection
// // -------------------
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tellichery";

// console.log("🔎 Mongo URI:", MONGO_URI); // Debug log

// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // -------------------
// // Static file serving
// // -------------------
// app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// // -------------------
// // API Routes
// // -------------------
// app.use('/api/youtube', youtubeRoutes);
// app.use('/api/home-video', homeVideoRoutes);
// app.use('/api/programme-diary', programmeDiaryRoutes);
// app.use('/api/website-links', websiteLinksRoutes);
// app.use('/api/news', newsRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/bulletins', bulletinRoutes);
// app.use('/api/downloads', downloadRoutes);
// app.use('/api/circulars', circularRoutes);
// app.use('/api/gallery', galleryRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/logs', logRoutes);
// // app.use('/api/import', importRoutes);
// app.use('/api/administration', administrationRoutes);
// app.use('/api/parish', parishroute);
// app.use('/api/upload-image', uploadImageRoute);
// // app.use('/api/parishes', parishesRoute);
// app.use('/api/statistics', statisticsRoutes);
// app.use("/api/pastoralCouncil", pastoralCouncilRoutes);

// // -------------------
// // Server start
// // -------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Backend server running at http://localhost:${PORT}`);
// });
