import { Router } from "express";
import { 
    obtenerEstados, 
    obtenerEstadoPorId,
    crearEstado, 
    actualizarEstado, 
    eliminarEstado,
    actualizarOrdenEstados
} from "../controllers/estado.controller";
import { verificarToken } from "../middlewares/verificarToken";
import { requirePermiso } from "../middlewares/requirePermiso";
import { AdminModulo, AdminAccion } from "../entities/Permiso.entity";

const router = Router();

// Rutas públicas
router.get("/", obtenerEstados);
router.get("/:id", obtenerEstadoPorId);

// Rutas protegidas (admin)
router.post("/", verificarToken, requirePermiso(AdminModulo.ESTADOS, AdminAccion.CREATE), crearEstado);
router.put("/orden/actualizar", verificarToken, requirePermiso(AdminModulo.ESTADOS, AdminAccion.UPDATE), actualizarOrdenEstados);
router.put("/:id", verificarToken, requirePermiso(AdminModulo.ESTADOS, AdminAccion.UPDATE), actualizarEstado);
router.delete("/:id", verificarToken, requirePermiso(AdminModulo.ESTADOS, AdminAccion.DELETE), eliminarEstado);

export default router; 