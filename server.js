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
import newsRoutes from './routes/news.js'; // ✅ Add this
import authRoutes from './routes/authRoutes.js';
import bulletinRoutes from './routes/bulletins.js';
import downloadRoutes from './routes/downloadRoutes.js'
import circularRoutes from './routes/circularRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import importRoutes from './routes/importRoutes.js';
import administrationRoutes from './routes/administration.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
app.use('/api/news', newsRoutes); // ✅ Mount news route here
app.use('/api/auth', authRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/import', importRoutes);
app.use('/api/administration', administrationRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
