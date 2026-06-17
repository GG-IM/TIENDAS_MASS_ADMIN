import { Router } from "express";
import { masterTableController } from "../controllers/masterTable.controller";
import { verificarToken } from "../middlewares/verificarToken";
import { requirePermiso } from "../middlewares/requirePermiso";
import { AdminModulo, AdminAccion } from "../entities/Permiso.entity";

const router = Router();

// Rutas públicas
router.get("/", masterTableController.list);
router.get("/:id", masterTableController.getById);

// Rutas protegidas (admin)
router.post("/", verificarToken, requirePermiso(AdminModulo.MASTER_TABLE, AdminAccion.CREATE), masterTableController.create);
router.put("/:id", verificarToken, requirePermiso(AdminModulo.MASTER_TABLE, AdminAccion.UPDATE), masterTableController.update);
router.delete("/:id", verificarToken, requirePermiso(AdminModulo.MASTER_TABLE, AdminAccion.DELETE), masterTableController.remove);

export default router;
