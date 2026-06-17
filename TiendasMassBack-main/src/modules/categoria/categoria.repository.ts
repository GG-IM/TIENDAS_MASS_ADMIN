import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Categoria } from '@entities/Categoria.entity';

export interface ICategoriaRepository {
  findAllWithRelations(): Promise<Categoria[]>;
  findByIdWithRelations(id: number): Promise<Categoria | null>;
  findById(id: number): Promise<Categoria | null>;
  findByName(name: string): Promise<Categoria | null>;
  create(data: Partial<Categoria>): Promise<Categoria>;
  update(entity: Categoria): Promise<Categoria>;
  delete(entity: Categoria): Promise<void>;
}

@injectable()
export class TypeOrmCategoriaRepository implements ICategoriaRepository {
  constructor(@inject('DataSource') private dataSource: DataSource) {}

  private get repo(): Repository<Categoria> {
    return this.dataSource.getRepository(Categoria);
  }

  async findAllWithRelations(): Promise<Categoria[]> {
    return this.repo.find({ relations: ['estado', 'productos'] });
  }

  async findByIdWithRelations(id: number): Promise<Categoria | null> {
    return this.repo.findOne({
      where: { id } as any,
      relations: ['productos', 'estado']
    });
  }

  async findById(id: number): Promise<Categoria | null> {
    return this.repo.findOne({ where: { id } as any });
  }

  async findByName(name: string): Promise<Categoria | null> {
    return this.repo.findOne({ where: { nombre: name } as any });
  }

  async create(data: Partial<Categoria>): Promise<Categoria> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(entity: Categoria): Promise<Categoria> {
    return this.repo.save(entity);
  }

  async delete(entity: Categoria): Promise<void> {
    await this.repo.remove(entity);
  }
}
