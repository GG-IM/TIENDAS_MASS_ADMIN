import { Router } from 'express';
import { getRoles, getRolById, createRol, updateRol, deleteRol } from '../controllers/rol.controller';
import { verificarToken } from '../middlewares/verificarToken';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Rutas públicas (para obtener roles)
router.get('/', getRoles);
router.get('/:id', getRolById);

// Rutas protegidas (solo para administradores)
router.post('/', verificarToken, requireAdmin, createRol);
router.put('/:id', verificarToken, requireAdmin, updateRol);
router.delete('/:id', verificarToken, requireAdmin, deleteRol);

export default router;