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
  res.json({
    success: true,
    message: "Import API is working!",
    timestamp: new Date().toISOString(),
  });
});

router.post("/test", (req, res) => {
  res.json({
    success: true,
    message: "POST request received!",
    data: req.body,
    timestamp: new Date().toISOString(),
  });
});

// ✅ Mount with proper paths
router.use("/parishes", parishRoutes);
router.use("/priests", priestRoutes);
router.use("/priest-others", priestOthersRoutes);
router.use("/administration", administrationRoutes);
router.use("/institutions", institutionRoutes);
router.use("/foranes", foraneRoutes);

export default router;
