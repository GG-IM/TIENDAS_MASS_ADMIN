import { Router } from "express";
import { 
    obtenerMetodosPago, 
    obtenerMetodoPagoPorId,
    crearMetodoPago, 
    actualizarMetodoPago, 
    eliminarMetodoPago 
} from "../controllers/metodopago.controller";
import { verificarToken } from "../middlewares/verificarToken";
import { requirePermiso } from "../middlewares/requirePermiso";
import { AdminModulo, AdminAccion } from "../entities/Permiso.entity";

const router = Router();

// Rutas públicas
router.get("/", obtenerMetodosPago);
router.get("/:id", obtenerMetodoPagoPorId);

// Rutas protegidas (admin)
router.post("/", verificarToken, requirePermiso(AdminModulo.METODO_PAGO, AdminAccion.CREATE), crearMetodoPago);
router.put("/:id", verificarToken, requirePermiso(AdminModulo.METODO_PAGO, AdminAccion.UPDATE), actualizarMetodoPago);
router.delete("/:id", verificarToken, requirePermiso(AdminModulo.METODO_PAGO, AdminAccion.DELETE), eliminarMetodoPago);

export default router;
