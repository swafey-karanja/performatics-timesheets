import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller";
import {
  asyncHandler,
  validate,
  authenticate,
  authorize,
} from "../middleware/index";

const router = Router();

const registerValidation = [
  body("staff_id").isInt({ min: 1 }).withMessage("Valid staff ID is required"),
  body("role")
    .optional()
    .isIn(["Admin", "Manager", "Staff"])
    .withMessage("Role must be Admin, Manager, or Staff"),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be 3–50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, underscores"),
  body("work_email")
    .notEmpty()
    .withMessage("Work email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
  body("department_id").optional().isInt({ min: 1 }),
];

const loginValidation = [
  body("password").notEmpty().withMessage("Password is required"),
  body("username").optional().isString(),
  body("work_email").optional().isEmail(),
];

router.post(
  "/register",
  authenticate,
  authorize("Admin"),
  validate(registerValidation),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  validate(loginValidation),
  asyncHandler(authController.login),
);
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.getProfile));

export default router;
