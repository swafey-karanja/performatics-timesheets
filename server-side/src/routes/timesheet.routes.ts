import { Router } from "express";
import { body, param, query } from "express-validator";
import * as timesheetController from "../controllers/timesheets.controller";
import { asyncHandler, validate } from "../middleware/index";

const router = Router();

/**
 * Timesheet Routes
 * @route /api/timesheets
 */

// Validation rules
const createTimesheetValidation = [
  body("staff_id")
    .notEmpty()
    .withMessage("Staff ID is required")
    .isInt({ min: 1 })
    .withMessage("Staff ID must be a positive integer"),

  body("task_description")
    .notEmpty()
    .withMessage("Task description is required")
    .isLength({ min: 5 })
    .withMessage("Task description must be at least 5 characters"),

  body("task_type").notEmpty().withMessage("Task type is required"),

  body("task_station")
    .notEmpty()
    .withMessage("Task station is required")
    .isIn(["Office", "Field", "Remote"])
    .withMessage("Task station must be Office, Field, or Remote"),

  body("department_id")
    .notEmpty()
    .withMessage("Department ID is required")
    .isInt({ min: 1 })
    .withMessage("Department ID must be a positive integer"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date"),

  body("check_in_time")
    .notEmpty()
    .withMessage("Check-in time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Check-in time must be in HH:MM:SS format"),

  body("check_out_time")
    .notEmpty()
    .withMessage("Check-out time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Check-out time must be in HH:MM:SS format"),

  body("client_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Client ID must be a positive integer"),

  body("project_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Project ID must be a positive integer"),
];

const updateTimesheetValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid timesheet ID"),

  body("task_description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Task description must be at least 5 characters"),

  body("task_station")
    .optional()
    .isIn(["Office", "Field", "Remote"])
    .withMessage("Task station must be Office, Field, or Remote"),

  body("check_in_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Check-in time must be in HH:MM:SS format"),

  body("check_out_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("Check-out time must be in HH:MM:SS format"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

const timesheetFilterValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  query("staffId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Staff ID must be a positive integer"),

  query("departmentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Department ID must be a positive integer"),
];

// Routes
router.get(
  "/",
  validate(timesheetFilterValidation),
  asyncHandler(timesheetController.getAllTimesheets),
);

router.get(
  "/:id",
  validate(idValidation),
  asyncHandler(timesheetController.getTimesheetById),
);

router.post(
  "/",
  validate(createTimesheetValidation),
  asyncHandler(timesheetController.createTimesheet),
);

router.put(
  "/:id",
  validate(updateTimesheetValidation),
  asyncHandler(timesheetController.updateTimesheet),
);

router.delete(
  "/:id",
  validate(idValidation),
  asyncHandler(timesheetController.deleteTimesheet),
);

router.get(
  "/staff/:staffId/hours",
  validate(idValidation),
  asyncHandler(timesheetController.getStaffHours),
);

router.get(
  "/projects/:projectId/hours",
  validate(idValidation),
  asyncHandler(timesheetController.getProjectHours),
);

export default router;
