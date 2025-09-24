// routes/index.js
import express from "express";
import parishRoutes from "./parishRoutes.js";
import priestRoutes from "./priestRoutes.js";
import priestOthersRoutes from "./priestOthersRoutes.js";
import administrationRoutes from "./administrationRoutes.js";
import institutionRoutes from "./institutionRoutes.js";
import foraneRoutes from "./foraneRoutes.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  console.log("✅ GET /api/test hit");
  res.json({
    success: true,
    message: "Import API is working!",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Mount all route modules with logs
console.log("📌 Mounting /api/parishes");
router.use("/parishes", parishRoutes);

console.log("📌 Mounting /api/priests");
router.use("/priests", priestRoutes);

console.log("📌 Mounting /api/priest-others");
router.use("/priest-others", priestOthersRoutes);

console.log("📌 Mounting /api/administration");
router.use("/administration", administrationRoutes);

console.log("📌 Mounting /api/institutions");
router.use("/institutions", institutionRoutes);

console.log("📌 Mounting /api/foranes");
router.use("/foranes", foraneRoutes);

export default router;
