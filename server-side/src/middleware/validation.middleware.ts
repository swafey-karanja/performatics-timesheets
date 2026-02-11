import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiError } from "./error.middleware";

/**
 * Validation middleware to handle express-validator results
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }));

    // Throw validation error
    const error = new ApiError(400, "Validation failed");
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Validation failed",
      errors: formattedErrors,
    });
  };
};
