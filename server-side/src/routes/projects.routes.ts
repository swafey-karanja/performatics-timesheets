import { Router } from "express";
import { body, param } from "express-validator";
import * as projectController from "../controllers/projects.controller";
import { asyncHandler, validate } from "../middleware";

const router = Router();

/**
 * Project Routes
 * @route /api/projects
 */

// Validation rules
const createProjectValidation = [
  body("project_name")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Project name must be between 2 and 150 characters"),

  body("client_id")
    .notEmpty()
    .withMessage("Client ID is required")
    .isInt({ min: 1 })
    .withMessage("Client ID must be a positive integer"),

  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("cluster")
    .notEmpty()
    .withMessage("Cluster is required")
    .isIn(["Stone", "Ballast", "Sand", "Water"])
    .withMessage("Cluster must be Stone, Ballast, Sand, or Water"),

  body("account_manager")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Account manager must be a positive integer"),
];

const updateProjectValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid project ID"),

  body("project_name")
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage("Project name must be between 2 and 150 characters"),

  body("client_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Client ID must be a positive integer"),

  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("cluster")
    .optional()
    .isIn(["Stone", "Ballast", "Sand", "Water"])
    .withMessage("Cluster must be Stone, Ballast, Sand, or Water"),

  body("account_manager")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Account manager must be a positive integer"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

// Routes
router.get("/active", asyncHandler(projectController.getActiveProjects));

router.get(
  "/account-manager/:accountManagerId",
  validate(idValidation),
  asyncHandler(projectController.getProjectsByAccountManager),
);

router.get("/", asyncHandler(projectController.getAllProjects));

router.get(
  "/:id",
  validate(idValidation),
  asyncHandler(projectController.getProjectById),
);

router.post(
  "/",
  validate(createProjectValidation),
  asyncHandler(projectController.createProject),
);

router.put(
  "/:id",
  validate(updateProjectValidation),
  asyncHandler(projectController.updateProject),
);

router.delete(
  "/:id",
  validate(idValidation),
  asyncHandler(projectController.deleteProject),
);

router.get(
  "/cluster/:cluster",
  asyncHandler(projectController.getProjectsByCluster),
);

router.get(
  "/:id/timesheets",
  validate(idValidation),
  asyncHandler(projectController.getProjectTimesheets),
);

router.get(
  "/:id/staff",
  validate(idValidation),
  asyncHandler(projectController.getProjectStaffBreakdown),
);

export default router;
