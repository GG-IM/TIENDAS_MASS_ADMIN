import { Router } from "express";
import { obtenerEstadisticasDashboard } from "../controllers/dashboard.controller";
import { verificarToken } from "../middlewares/verificarToken";
import { requirePermiso } from "../middlewares/requirePermiso";
import { AdminModulo, AdminAccion } from "../entities/Permiso.entity";

const router = Router();

// Dashboard protegido
router.get("/estadisticas", verificarToken, requirePermiso(AdminModulo.DASHBOARD, AdminAccion.READ), obtenerEstadisticasDashboard);

export default router; 