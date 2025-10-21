// src/middlewares/errorHandler.ts
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: err.issues.map(e => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || "Internal server error",
  });
}
