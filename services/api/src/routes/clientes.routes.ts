import { Router } from "express";
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from "../controllers/clientes.controller";
import { createClienteValidator, updateClienteValidator } from "../middlewares/cliente.validation";
import { validateRequest, idParamValidator } from "../middlewares/validation";

const router = Router({ mergeParams: true }); //heredamos los params de la ruta padre


/**
 * body ejemplo
 * {
  "razon_social": "prueba",
  "nombre_comercial": "prueba",
  "rfc": "XAXX010101012",
  "correo": "ejemplo.ejemplo@iteso.mx",
  "telefono": "3312345678"
}
 */

router.get('/', getClientes);
router.get('/:id', idParamValidator(), validateRequest, getClienteById);
router.post('/', createClienteValidator(), validateRequest, createCliente);
router.put('/:id', idParamValidator(), updateClienteValidator(), validateRequest, updateCliente);
router.delete('/:id', idParamValidator(), validateRequest, deleteCliente);

export default router;