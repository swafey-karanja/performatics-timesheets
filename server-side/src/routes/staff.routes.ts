import { Router } from "express";
import { body, param } from "express-validator";
import * as staffController from "../controllers/staff.controller";
import { asyncHandler, validate } from "../middleware/index";

const router = Router();

/**
 * Staff Routes
 * @route /api/staff
 */

// Validation rules
const createStaffValidation = [
  body("staff_name")
    .notEmpty()
    .withMessage("Staff name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Staff name must be between 2 and 100 characters"),

  body("work_type")
    .notEmpty()
    .withMessage("Work type is required")
    .isIn(["Employment", "Consultancy", "Internship"])
    .withMessage("Work type must be Employment, Consultancy, or Internship"),

  body("staff_role")
    .notEmpty()
    .withMessage("Staff role is required")
    .isLength({ max: 100 })
    .withMessage("Staff role must not exceed 100 characters"),

  body("gender")
    .optional()
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),

  body("personal_email")
    .notEmpty()
    .withMessage("Personal email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("phone_number")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Phone number must not exceed 20 characters"),

  body("date_joined")
    .notEmpty()
    .withMessage("Date joined is required")
    .isISO8601()
    .withMessage("Date joined must be a valid date"),
];

const updateStaffValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid staff ID"),

  body("staff_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Staff name must be between 2 and 100 characters"),

  body("work_type")
    .optional()
    .isIn(["Employment", "Consultancy", "Internship"])
    .withMessage("Work type must be Employment, Consultancy, or Internship"),

  body("personal_email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

// Routes
router.get("/", asyncHandler(staffController.getAllStaff));

router.get(
  "/:id",
  validate(idValidation),
  asyncHandler(staffController.getStaffById),
);

router.post(
  "/",
  validate(createStaffValidation),
  asyncHandler(staffController.createStaff),
);

router.put(
  "/:id",
  validate(updateStaffValidation),
  asyncHandler(staffController.updateStaff),
);

router.delete(
  "/:id",
  validate(idValidation),
  asyncHandler(staffController.deleteStaff),
);

router.get(
  "/work-type/:type",
  asyncHandler(staffController.getStaffByWorkType),
);

export default router;
