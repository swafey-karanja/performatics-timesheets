import { Router } from "express";
import * as healthController from "../controllers/health.controller";
import { asyncHandler } from "../middleware/index";

const router = Router();

/**
 * Health Check Routes
 * @route /health
 */

router.get("/", asyncHandler(healthController.healthCheck));

router.get("/detailed", asyncHandler(healthController.detailedHealthCheck));

export default router;
