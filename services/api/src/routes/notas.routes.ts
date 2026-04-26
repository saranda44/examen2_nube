import { Router } from "express";
import { createNota, getNotaById, descargarNota } from "../controllers/notas.controller";
import { createNotaValidator } from "../middlewares/nota.validation";
import { createDetalleNotaValidator } from "../middlewares/nota.detalle.validation";
import { idParamValidator, validateRequest } from "../middlewares/validation";
const router = Router({ mergeParams: true });

/**body ejemplo
 * {
  "cliente_id": 1,
  "direccion_facturacion_id": 2,
  "direccion_envio_id": 1,
  "detalles": [
    
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
 */

router.get('/:rfc/:folio/descargar', descargarNota);
router.get('/:id', idParamValidator(), validateRequest, getNotaById);
router.post('/', createNotaValidator(), createDetalleNotaValidator(), validateRequest, createNota);

export default router;