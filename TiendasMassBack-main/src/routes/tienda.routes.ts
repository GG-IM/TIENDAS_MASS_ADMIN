import { Router } from "express";
import {
  obtenerTiendas,
  obtenerTiendaPorId,
  crearTienda,
  actualizarTienda,
  eliminarTienda,
  obtenerTiendasActivas
} from "../controllers/tienda.controller";
import { verificarToken } from "../middlewares/verificarToken";
import { requirePermiso } from "../middlewares/requirePermiso";
import { AdminModulo, AdminAccion } from "../entities/Permiso.entity";

const router = Router();

// Rutas públicas
router.get("/", obtenerTiendas);
router.get("/activas", obtenerTiendasActivas);
router.get("/:id", obtenerTiendaPorId);

// Rutas protegidas (admin)
router.post("/", verificarToken, requirePermiso(AdminModulo.TIENDAS, AdminAccion.CREATE), crearTienda);
router.put("/:id", verificarToken, requirePermiso(AdminModulo.TIENDAS, AdminAccion.UPDATE), actualizarTienda);
router.delete("/:id", verificarToken, requirePermiso(AdminModulo.TIENDAS, AdminAccion.DELETE), eliminarTienda);

export default router;
