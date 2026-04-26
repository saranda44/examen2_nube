
import { Request, Response } from "express";
import { validationResult, param } from "express-validator";

//validacion del parametro id para obtener, actualizar o eliminar
export function idParamValidator() {
  return [
    param("id").isInt().withMessage("ID debe ser numérico"),
  ];
}

//Validacion general
export function validateRequest(req: Request, res: Response, next: Function) {
  //validar que las validaciones anteriores no den error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}