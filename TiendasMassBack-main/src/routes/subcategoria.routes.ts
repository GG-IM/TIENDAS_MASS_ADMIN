import express from 'express';
import {
  getAllSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategoria.controller';
import { verificarToken } from '../middlewares/verificarToken';
import { requirePermiso } from '../middlewares/requirePermiso';
import { AdminModulo, AdminAccion } from '../entities/Permiso.entity';

const router = express.Router();

// Rutas públicas
router.get('/', getAllSubcategories);
router.get('/categoria/:categoriaId', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

// Rutas protegidas (admin)
router.post('/', verificarToken, requirePermiso(AdminModulo.SUBCATEGORIAS, AdminAccion.CREATE), createSubcategory);
router.put('/:id', verificarToken, requirePermiso(AdminModulo.SUBCATEGORIAS, AdminAccion.UPDATE), updateSubcategory);
router.delete('/:id', verificarToken, requirePermiso(AdminModulo.SUBCATEGORIAS, AdminAccion.DELETE), deleteSubcategory);

export default router;
