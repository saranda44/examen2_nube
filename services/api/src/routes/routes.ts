import { Router, json } from "express";
import clientesRoutes from "./clientes.routes";
import domicilioRoutes from "./domicilio.routes";
import productosRoutes from "./productos.routes";
import notasRoutes from "./notas.routes";

const router = Router();

// Middleware para parsear JSON
router.use(json());
router.use('/clientes', clientesRoutes);
router.use('/domicilios', domicilioRoutes);
router.use('/productos', productosRoutes);
router.use('/notas', notasRoutes);

export default router;