import express from 'express';
import { CategoriaController } from './categoria.controller';
import { validate } from '@core/middleware/validate';
import { createCategoriaSchema, getDeleteCategoriaSchema, updateCategoriaSchema } from './categoria.validator';

export const createCategoriaRoutes = (controller: CategoriaController) => {
  const router = express.Router();

  router.get('/', controller.getAllCategories);
  
  router.get('/:id', validate(getDeleteCategoriaSchema), controller.getCategoryById);
  
  router.post('/', validate(createCategoriaSchema), controller.createCategory);
  
  router.put('/:id', validate(updateCategoriaSchema), controller.updateCategory);
  
  router.delete('/:id', validate(getDeleteCategoriaSchema), controller.deleteCategory);

  return router;
};
