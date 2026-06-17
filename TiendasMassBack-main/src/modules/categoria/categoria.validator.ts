import { z } from 'zod';

export const createCategoriaSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre de la categoría es requerido'),
    descripcion: z.string().optional().nullable(),
    estado: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
  }),
});

export const updateCategoriaSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
  body: z.object({
    nombre: z.string().min(1).optional(),
    descripcion: z.string().optional().nullable(),
    estado: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
  }),
});

export const getDeleteCategoriaSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID inválido'),
  }),
});
