import 'reflect-metadata';
import { container } from 'tsyringe';
import { AppDataSource } from '../config/data-source';

import { TypeOrmCategoriaRepository } from '../modules/categoria/categoria.repository';
import { CategoriaService } from '../modules/categoria/categoria.service';

// Data source instance
container.registerInstance('DataSource', AppDataSource);

// Categoria
container.registerSingleton('ICategoriaRepository', TypeOrmCategoriaRepository);
container.registerSingleton('ICategoriaService', CategoriaService);

// Aquí registraremos los repositorios, servicios y controllers
// container.registerSingleton('IUserInterface', ClassImplementation);

export { container };

