import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware untuk memvalidasi req.body menggunakan Zod Schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = result.error as ZodError;
      const fieldErrors = error.flatten().fieldErrors;
      res.status(400).json({
        error: "Validasi data gagal. Periksa kembali input Anda.",
        fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Middleware untuk memvalidasi req.query menggunakan Zod Schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const error = result.error as ZodError;
      const fieldErrors = error.flatten().fieldErrors;
      res.status(400).json({
        error: "Validasi parameter query gagal.",
        fieldErrors,
      });
      return;
    }
    req.query = result.data as any;
    next();
  };
}

/**
 * Middleware untuk memvalidasi req.params menggunakan Zod Schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const error = result.error as ZodError;
      const fieldErrors = error.flatten().fieldErrors;
      res.status(400).json({
        error: "Validasi parameter URL gagal.",
        fieldErrors,
      });
      return;
    }
    req.params = result.data as any;
    next();
  };
}

