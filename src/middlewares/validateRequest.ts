import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";


export const validateRequest =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // validate the request body
      next();
    } catch (error: any) {
      if (error.errors) {
        // Format Zod error messages nicely
        const formatted = error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: formatted,
        });
      }

      // Fallback generic error
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid request",
      });
    }
  };
