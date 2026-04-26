import { body, param } from "express-validator";

//validaciones para crear y actualizar un domicilio 
export function createDomicilioValidator() {
  return [
    body("domicilio")
      .trim()
      .notEmpty()
      .withMessage("El domicilio es obligatorio"),

    body("colonia")
      .trim()
      .notEmpty()
      .withMessage("La colonia es obligatoria"),

    body("municipio")
      .trim()
      .notEmpty()
      .withMessage("El municipio es obligatorio"),

    body("estado")
      .trim()
      .notEmpty()
      .withMessage("El estado es obligatorio"),

    body("tipo")
      .isIn(["FACTURACION", "ENVIO"])
      .withMessage("El tipo de dirección debe ser FACTURACION o ENVIO"),
  ];
}

//para actualizar es opcional todos los campos
export function updateDomicilioValidator() {
  return [
    body("domicilio")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El domicilio no puede estar vacío"),

    body("colonia")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("La colonia no puede estar vacía"),

    body("municipio")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El municipio no puede estar vacío"),

    body("estado")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El estado no puede estar vacío"),

    body("tipo")
      .optional()
      .isIn(["FACTURACION", "ENVIO"])
      .withMessage("El tipo de dirección debe ser FACTURACION o ENVIO"),
  ];
}