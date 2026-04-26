import { body } from "express-validator";

//validar que tenga cliente, direcciones, y arreglo de detalles
export function createNotaValidator() {
  return [
    body("cliente_id")
      .isInt({ min: 1 })
      .withMessage("cliente_id debe ser válido"),

    body("direccion_facturacion_id")
      .isInt({ min: 1 })
      .withMessage("Dirección de facturación inválida"),

    body("direccion_envio_id")
      .isInt({ min: 1 })
      .withMessage("Dirección de envío inválida"),

    body("detalles")
      .isArray({ min: 1 })
      .withMessage("La nota debe tener al menos un producto"),
  ];
}