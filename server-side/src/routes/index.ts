import { Router } from "express";
import staffRoutes from "./staff.routes";
import timesheetRoutes from "./timesheet.routes";
import healthRoutes from "./health.routes";
import clientRoutes from "./client.routes";
import departmentRoutes from "./department.routes";
import projectRoutes from "./projects.routes";

const router = Router();

// Add this before your other routes
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Timesheet API Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

/**
 * Main API Routes
 */

// Health check routes
router.use("/health", healthRoutes);

// API routes
router.use("/api/staff", staffRoutes);
router.use("/api/timesheets", timesheetRoutes);
router.use("/api/clients", clientRoutes);
router.use("/api/departments", departmentRoutes);
router.use("/api/projects", projectRoutes);

export default router;
