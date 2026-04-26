import { body, param } from "express-validator";

//Clientes (ID, Razón Social, Nombre Comercial, RFC, Correo electrónico, Teléfono)

// Regex para RFC Mexicano (Persona Física y Moral)
const RFC_REGEX = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
// Regex para Teléfono (10 dígitos)
const TEL_REGEX = /^[0-9]{10}$/;


//validacion de datos para crear un cliente
export function createClienteValidator() {
  return [
    body("razon_social").notEmpty().withMessage("La razón social es obligatoria"),
    body("nombre_comercial").notEmpty().withMessage("El nombre comercial es obligatorio"),
    body("rfc").trim().toUpperCase().matches(RFC_REGEX).withMessage("El formato de RFC es inválido"),
    body("correo").isEmail().withMessage("Proporcione un correo electrónico válido"),
    body("telefono").trim().matches(TEL_REGEX).withMessage("El teléfono debe tener 10 dígitos numéricos"),
  ];
}

//validacion de datos para actualizar un cliente, todos los campos son opcionales pero si se proporcionan deben ser validos
export function updateClienteValidator() {
  return [
    body("razon_social").optional().notEmpty(),
    body("nombre_comercial").optional().notEmpty(),
    body("rfc").optional().trim().toUpperCase().matches(RFC_REGEX).withMessage("Formato de RFC inválido"),
    body("correo").optional().isEmail().withMessage("Correo inválido"),
    body("telefono").optional().trim().matches(TEL_REGEX).withMessage("El teléfono debe ser de 10 dígitos"),
  ];
}


