import { Router } from "express";
import { getDomicilios, getDomicilioById, getDomiciliosByCliente, updateDomicilio, createDomicilio, deleteDomicilio } from "../controllers/domicilio.controller";
import { createDomicilioValidator, updateDomicilioValidator } from "../middlewares/domicilio.validation";
import { validateRequest, idParamValidator } from "../middlewares/validation";
const router = Router({ mergeParams: true }); //heredamos los params de la ruta padre


/**body ejemplo
 * {
  "cliente_id": 1,
  "domicilio": "prueba3",
  "colonia": "prueba",
  "municipio": "prueba",
  "estado": "prueba",
  "tipo": "FACTURACION"
}
 */

router.get('/', getDomicilios);
router.get('/:id', idParamValidator(), validateRequest, getDomicilioById);
router.get('/clientes/:id', idParamValidator(), validateRequest, getDomiciliosByCliente);
router.post('/', createDomicilioValidator(), validateRequest, createDomicilio);
router.put('/:id', idParamValidator(), updateDomicilioValidator(), validateRequest, updateDomicilio);
router.delete('/:id', idParamValidator(), validateRequest, deleteDomicilio);

export default router;