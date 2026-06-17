import { injectable, inject } from 'tsyringe';
import { ICategoriaRepository } from './categoria.repository';
import { AppError } from '@core/errors/AppError';

@injectable()
export class CategoriaService {
  constructor(
    @inject('ICategoriaRepository') private repo: ICategoriaRepository
  ) {}

  async getAll() {
    return this.repo.findAllWithRelations();
  }

  async getById(id: number) {
    const category = await this.repo.findByIdWithRelations(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return category;
  }

  async create(data: any) {
    const { nombre, descripcion, estado } = data;

    if (!nombre || nombre.trim() === '') {
      throw new AppError('El nombre de la categoría es requerido', 400);
    }

    const existingCategory = await this.repo.findByName(nombre.trim());
    if (existingCategory) {
      throw new AppError('Ya existe una categoría con ese nombre', 409);
    }

    const categoryData: any = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
    };

    if (estado && !isNaN(parseInt(estado))) {
      categoryData.estado = { id: parseInt(estado) };
    } else {
      categoryData.estado = { id: 1 };
    }

    const savedCategory = await this.repo.create(categoryData);
    
    // Recargar con relaciones
    return this.repo.findByIdWithRelations(savedCategory.id);
  }

  async update(id: number, data: any) {
    const { nombre, descripcion, estado } = data;

    const category = await this.repo.findByIdWithRelations(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (nombre !== undefined && nombre !== null) {
      category.nombre = nombre.trim();
    }
    
    if (descripcion !== undefined) {
      category.descripcion = descripcion?.trim() || null;
    }
    
    if (estado !== undefined && estado !== null) {
      if (typeof estado === 'boolean') {
        category.estado = { id: estado ? 1 : 2 } as any;
      } else if (estado === 'true' || estado === 'false') {
        category.estado = { id: estado === 'true' ? 1 : 2 } as any;
      } else if (!isNaN(parseInt(estado as string))) {
        category.estado = { id: parseInt(estado as string) } as any;
      }
    }

    await this.repo.update(category);

    return this.repo.findByIdWithRelations(id);
  }

  async delete(id: number) {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    await this.repo.delete(category);
    return { message: 'Categoría eliminada correctamente' };
  }
}
