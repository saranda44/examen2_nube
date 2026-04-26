import { Router } from "express";
import { deleteProducto, updateProducto, createProducto, getProductoById, getProductos } from "../controllers/productos.controller";
import { validateRequest, idParamValidator } from "../middlewares/validation";
import { createProductoValidator, updateProductoValidator } from "../middlewares/productos.validation";

const router = Router({ mergeParams: true }); //heredamos los params de la ruta padre

/**body ejemplo
 * {
  "nombre": "PantallaLED",
  "unidad_medida": "pieza",
  "precio_base": "0"
}
 */



router.get('/', getProductos);
router.get('/:id', idParamValidator(), validateRequest, getProductoById);
router.post('/', createProductoValidator(), validateRequest, createProducto);
router.put('/:id', idParamValidator(), updateProductoValidator(), validateRequest, updateProducto);
router.delete('/:id', idParamValidator(), validateRequest, deleteProducto);

export default router;