import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Validation Middleware
const validationMiddleware = <T>(
  schema: ZodSchema<T>,
  source: "body" | "params" | "query" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Determine where to get the data from (body, params, or query)
      const data =
        source === "body"
          ? req.body
          : source === "params"
          ? req.params
          : req.query;

      // Validate the data using the Zod schema
      schema.parse(data);
      next(); // Proceed to the next middleware if validation is successful
    } catch (error) {
      // If there is a validation error, map the errors to user-friendly messages
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 400,
          message: `${error.errors[0].message}`,
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
          toast: true,
        });
      }
      // For other errors, pass them to the default error handler
      next(error);
    }
  };
};

export default validationMiddleware;