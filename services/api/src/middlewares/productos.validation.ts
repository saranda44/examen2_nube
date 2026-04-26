import { body } from "express-validator";

//validar body para crear producto
export function createProductoValidator() {
  return [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre del producto es obligatorio"),

    body("unidad_medida")
      .trim()
      .notEmpty()
      .withMessage("La unidad de medida es obligatoria"),

    body("precio_base")
      .isFloat({ gt: 0 })
      .withMessage("El precio base debe ser mayor a 0"),
  ];
}

//todo es opcional pero debe ser valido si se proporcionan
export function updateProductoValidator() {
  return [
    body("nombre")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío"),

    body("unidad_medida")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("La unidad de medida no puede estar vacía"),

    body("precio_base")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("El precio base debe ser mayor a 0"),
  ];
}