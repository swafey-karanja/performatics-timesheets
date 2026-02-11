import { Router } from "express";
import { body, param } from "express-validator";
import * as departmentController from "../controllers/department.controller";
import { asyncHandler, validate } from "../middleware";

const router = Router();

/**
 * Department Routes
 * @route /api/departments
 */

// Validation rules
const createDepartmentValidation = [
  body("department_name")
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters"),

  body("department_head_id")
    .notEmpty()
    .withMessage("Department head ID is required")
    .isInt({ min: 1 })
    .withMessage("Department head ID must be a positive integer"),
];

const updateDepartmentValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid department ID"),

  body("department_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters"),

  body("department_head_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Department head ID must be a positive integer"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

// Routes
router.get("/", asyncHandler(departmentController.getAllDepartments));

router.get(
  "/:id",
  validate(idValidation),
  asyncHandler(departmentController.getDepartmentById),
);

router.post(
  "/",
  validate(createDepartmentValidation),
  asyncHandler(departmentController.createDepartment),
);

router.put(
  "/:id",
  validate(updateDepartmentValidation),
  asyncHandler(departmentController.updateDepartment),
);

router.delete(
  "/:id",
  validate(idValidation),
  asyncHandler(departmentController.deleteDepartment),
);

router.get(
  "/:id/staff",
  validate(idValidation),
  asyncHandler(departmentController.getDepartmentStaff),
);

export default router;
