import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { CategoriaService } from './categoria.service';

@injectable()
export class CategoriaController {
  constructor(
    @inject('ICategoriaService') private service: CategoriaService
  ) {}

  getAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.getById(parseInt(id));
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.update(parseInt(id), req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.delete(parseInt(id));
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
