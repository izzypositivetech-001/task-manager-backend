import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import { exportTaskReport, exportUserReport } from "../controller/reportController.js";

const router = express.Router(); 

router.get("/export/tasks", protect, adminOnly, exportTaskReport); //Export all tasks as Exel/PDF
router.get("/export/users", protect, adminOnly, exportUserReport); //Export user-tasks report

export default router;
