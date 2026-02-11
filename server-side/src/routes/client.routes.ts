import { Router } from "express";
import { body, param } from "express-validator";
import * as clientController from "../controllers/client.controller";
import { asyncHandler, validate } from "../middleware";

const router = Router();

/**
 * Client Routes
 * @route /api/clients
 */

// Validation rules
const createClientValidation = [
  body("client_name")
    .notEmpty()
    .withMessage("Client name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Client name must be between 2 and 150 characters"),

  body("sector")
    .notEmpty()
    .withMessage("Sector is required")
    .isIn(["Non-profit", "Individual", "Startup", "Government"])
    .withMessage(
      "Sector must be Non-profit, Individual, Startup, or Government",
    ),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Converted", "Prospect"])
    .withMessage("Category must be Converted or Prospect"),

  body("account_manager_id")
    .notEmpty()
    .withMessage("Account manager ID is required")
    .isInt({ min: 1 })
    .withMessage("Account manager ID must be a positive integer"),

  body("entry_date")
    .optional()
    .isISO8601()
    .withMessage("Entry date must be a valid date"),
];

const updateClientValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid client ID"),

  body("client_name")
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage("Client name must be between 2 and 150 characters"),

  body("sector")
    .optional()
    .isIn(["Non-profit", "Individual", "Startup", "Government"])
    .withMessage(
      "Sector must be Non-profit, Individual, Startup, or Government",
    ),

  body("category")
    .optional()
    .isIn(["Converted", "Prospect"])
    .withMessage("Category must be Converted or Prospect"),

  body("account_manager_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Account manager ID must be a positive integer"),

  body("entry_date")
    .optional()
    .isISO8601()
    .withMessage("Entry date must be a valid date"),
];

const idValidation = [param("id").isInt({ min: 1 }).withMessage("Invalid ID")];

// Routes
router.get("/", asyncHandler(clientController.getAllClients));

router.get(
  "/:id",
  validate(idValidation),
  asyncHandler(clientController.getClientById),
);

router.post(
  "/",
  validate(createClientValidation),
  asyncHandler(clientController.createClient),
);

router.put(
  "/:id",
  validate(updateClientValidation),
  asyncHandler(clientController.updateClient),
);

router.delete(
  "/:id",
  validate(idValidation),
  asyncHandler(clientController.deleteClient),
);

router.get(
  "/sector/:sector",
  asyncHandler(clientController.getClientsBySector),
);

router.get(
  "/category/:category",
  asyncHandler(clientController.getClientsByCategory),
);

router.get(
  "/:id/projects",
  validate(idValidation),
  asyncHandler(clientController.getClientProjects),
);

export default router;
