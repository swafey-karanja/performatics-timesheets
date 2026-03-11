import { Router } from "express";
import { body, param } from "express-validator";
import * as staffController from "../controllers/staff.controller";
import {
  asyncHandler,
  authenticate,
  authorize,
  validate,
} from "../middleware/index";

const router = Router();

/**
 * Staff Routes
 * Base path: /api/staff
 */

// ─── Validation rules ─────────────────────────────────────────────────────────

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

const createAccountValidation = [
  body("staff_id")
    .notEmpty()
    .withMessage("Staff ID is required")
    .isInt({ min: 1 })
    .withMessage("Staff ID must be a positive integer"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username may only contain letters, numbers, and underscores"),

  body("work_email")
    .notEmpty()
    .withMessage("Work email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("status")
    .optional()
    .isIn(["Active", "Suspended"])
    .withMessage("Status must be Active or Suspended"),

  body("role")
    .optional()
    .isIn(["Admin", "Manager", "Staff"])
    .withMessage("Role must be Admin, Manager, or Staff"),

  body("department_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Department ID must be a positive integer"),
];

const updateAccountValidation = [
  param("accountId").isInt({ min: 1 }).withMessage("Invalid account ID"),

  body("username")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username may only contain letters, numbers, and underscores"),

  body("work_email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("department_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Department ID must be a positive integer"),
];

const updateStatusValidation = [
  param("accountId").isInt({ min: 1 }).withMessage("Invalid account ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Active", "Suspended"])
    .withMessage("Status must be Active or Suspended"),
];

const updateRoleValidation = [
  param("accountId").isInt({ min: 1 }).withMessage("Invalid account ID"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["Admin", "Manager", "Staff"])
    .withMessage("Role must be Admin, Manager, or Staff"),
];

const updatePasswordValidation = [
  param("accountId").isInt({ min: 1 }).withMessage("Invalid account ID"),
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),
  body("new_password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

const accountIdValidation = [
  param("accountId").isInt({ min: 1 }).withMessage("Invalid account ID"),
];

// ─── Staff Details routes ─────────────────────────────────────────────────────

// GET /api/staff
router.get(
  "/",
  authenticate,
  authorize("Admin", "Manager"),
  asyncHandler(staffController.getAllStaffDetails),
);

// GET /api/staff/work-type/:type
// NOTE: must be defined before /:id to avoid Express matching "work-type" as an id
router.get(
  "/work-type/:type",
  authenticate,
  asyncHandler(staffController.getStaffByWorkType),
);

// GET /api/staff/:id
router.get(
  "/:id",
  authenticate,
  validate(idValidation),
  asyncHandler(staffController.getStaffById),
);

// GET /api/staff/:id/account
router.get(
  "/:id/account",
  authenticate,
  authorize("Admin", "Manager"),
  validate(idValidation),
  asyncHandler(staffController.getAccountByStaffId),
);

// POST /api/staff
router.post(
  "/",
  authenticate,
  authorize("Admin", "Manager"),
  validate(createStaffValidation),
  asyncHandler(staffController.createStaff),
);

// PUT /api/staff/:id
router.put(
  "/:id",
  authenticate,
  authorize("Admin", "Manager"),
  validate(updateStaffValidation),
  asyncHandler(staffController.updateStaff),
);

// DELETE /api/staff/:id
router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  validate(idValidation),
  asyncHandler(staffController.deleteStaff),
);

// ─── Staff Accounts routes ────────────────────────────────────────────────────

// GET /api/staff/accounts
router.get(
  "/accounts",
  authenticate,
  authorize("Admin", "Manager"),
  asyncHandler(staffController.getAllAccounts),
);

// GET /api/staff/accounts/:accountId
router.get(
  "/accounts/:accountId",
  authenticate,
  authorize("Admin", "Manager"),
  validate(accountIdValidation),
  asyncHandler(staffController.getAccountById),
);

// POST /api/staff/accounts
router.post(
  "/accounts",
  authenticate,
  authorize("Admin"),
  validate(createAccountValidation),
  asyncHandler(staffController.createAccount),
);

// PUT /api/staff/accounts/:accountId
router.put(
  "/accounts/:accountId",
  authenticate,
  authorize("Admin", "Manager"),
  validate(updateAccountValidation),
  asyncHandler(staffController.updateAccount),
);

// PATCH /api/staff/accounts/:accountId/status
router.patch(
  "/accounts/:accountId/status",
  authenticate,
  authorize("Admin", "Manager"),
  validate(updateStatusValidation),
  asyncHandler(staffController.updateAccountStatus),
);

// PATCH /api/staff/accounts/:accountId/role
router.patch(
  "/accounts/:accountId/role",
  authenticate,
  authorize("Admin"),
  validate(updateRoleValidation),
  asyncHandler(staffController.updateAccountRole),
);

// PATCH /api/staff/accounts/:accountId/password
router.patch(
  "/accounts/:accountId/password",
  authenticate,
  validate(updatePasswordValidation),
  asyncHandler(staffController.updateAccountPassword),
);

// DELETE /api/staff/accounts/:accountId
router.delete(
  "/accounts/:accountId",
  authenticate,
  authorize("Admin"),
  validate(accountIdValidation),
  asyncHandler(staffController.deleteAccount),
);

export default router;
