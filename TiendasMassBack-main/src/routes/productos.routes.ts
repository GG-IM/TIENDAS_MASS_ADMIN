import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByIds } from '../controllers/productos.controller';
import upload from '../middlewares/upload'; // Asegúrate que este es tu config de multer
import { verificarToken } from '../middlewares/verificarToken';
import { requirePermiso } from '../middlewares/requirePermiso';
import { AdminModulo, AdminAccion } from '../entities/Permiso.entity';

const router = Router();

// Rutas públicas (catálogo)
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/bulk', getProductsByIds);

// Rutas protegidas (admin)
router.post('/', verificarToken, requirePermiso(AdminModulo.PRODUCTOS, AdminAccion.CREATE), upload.single('imagen'), createProduct);
router.put('/:id', verificarToken, requirePermiso(AdminModulo.PRODUCTOS, AdminAccion.UPDATE), upload.single('imagen'), updateProduct);
router.delete('/:id', verificarToken, requirePermiso(AdminModulo.PRODUCTOS, AdminAccion.DELETE), deleteProduct);

export default router;
