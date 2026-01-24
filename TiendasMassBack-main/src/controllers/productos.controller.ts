import { Request, Response } from 'express';
import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/data-source'; // Ajusta la ruta según tu estructura
import { Producto } from '../entities/Producto.entity';
import { Categoria } from '../entities/Categoria.entity';
import { Subcategoria } from '../entities/Subcategoria.entity';
import { Estado } from '../entities/Estado.entity';

// Interfaces para tipado
interface ProductCreateRequest {
  nombre: string;
  marca?: string;
  precio: number;
  descripcion?: string;
  stock?: number;
  estado?: boolean;
  categoria_id: number;
  subcategoria_ids?: number[]; // Ahora es un array
}

interface ProductUpdateRequest {
  nombre?: string;
  marca?: string;
  precio?: number;
  descripcion?: string;
  imagen?: string;
  stock?: number;
  estado?: boolean;
  categoria_id?: number;
  subcategoria_ids?: number[]; // Ahora es un array
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class ProductController {
  private productRepository: Repository<Producto>;
  private categoryRepository: Repository<Categoria>;
  private subcategoryRepository: Repository<Subcategoria>;
  private estadoRepository: Repository<Estado>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Producto);
    this.categoryRepository = AppDataSource.getRepository(Categoria);
    this.subcategoryRepository = AppDataSource.getRepository(Subcategoria);
    this.estadoRepository = AppDataSource.getRepository(Estado);
  }

  // Función auxiliar para normalizar productos
  private normalizeProduct = (product: Producto) => {
    return {
      ...product,
      precio: Number(product.precio),
      stock: Number(product.stock),
      categoria_id: product.categoria?.id,
      subcategoria_ids: product.subcategorias?.map(s => s.id) || [],
      estado_nombre: product.estado?.nombre
    };
  };

  public getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoriaId = req.query.categoriaId as string;
      const subcategoriaId = req.query.subcategoriaId as string;
      const searchQuery = (req.query.q as string)?.toLowerCase();
      let products: Producto[];

      // Usamos QueryBuilder para búsquedas flexibles
      const baseQuery = this.productRepository
        .createQueryBuilder('producto')
        .distinct(true)
        .leftJoinAndSelect('producto.categoria', 'categoria')
        .leftJoinAndSelect('producto.subcategorias', 'subcategorias')
        .leftJoinAndSelect('producto.estado', 'estado');

      if (categoriaId) {
        baseQuery.andWhere('categoria.id = :categoriaId', { categoriaId: parseInt(categoriaId) });
      }

      if (subcategoriaId) {
        baseQuery.andWhere('subcategorias.id = :subcategoriaId', { subcategoriaId: parseInt(subcategoriaId) });
      }

      if (searchQuery) {
        baseQuery.andWhere(
          '(LOWER(producto.nombre) LIKE :q OR LOWER(producto.descripcion) LIKE :q)',
          { q: `%${searchQuery}%` }
        );
      }

      products = await baseQuery.getMany();

      const normalizedProducts = products.map(this.normalizeProduct);
      res.json(normalizedProducts);
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  };

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de producto inválido' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['categoria', 'subcategorias', 'estado']
      });

      if (!product) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
      }

      // Normalizar producto antes de enviar
      const normalizedProduct = this.normalizeProduct(product);
      res.json(normalizedProduct);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      });
    }
  };

  public createProduct = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      const { 
        nombre, 
        marca, 
        precio, 
        descripcion, 
        stock = 0, 
        estado = true, 
        categoria_id,
        subcategoria_ids: subcategoria_idsRaw = '[]'
      } = req.body;

      // Parsear subcategoria_ids si es string JSON
      let subcategoria_ids: number[] = [];
      try {
        subcategoria_ids = typeof subcategoria_idsRaw === 'string' 
          ? JSON.parse(subcategoria_idsRaw) 
          : (Array.isArray(subcategoria_idsRaw) ? subcategoria_idsRaw : []);
      } catch (e) {
        subcategoria_ids = [];
      }

      // Validaciones básicas
      if (!nombre || !precio || !categoria_id) {
        res.status(400).json({ 
          message: 'Los campos nombre, precio y categoria_id son requeridos' 
        });
        return;
      }

      // Validar si la categoría existe
      const category = await this.categoryRepository.findOne({
        where: { id: categoria_id }
      });
      
      if (!category) {
        res.status(400).json({ message: 'Categoría no válida' });
        return;
      }

      // Validar subcategorías si se proporcionan
      let subcategories: Subcategoria[] = [];
      if (Array.isArray(subcategoria_ids) && subcategoria_ids.length > 0) {
        subcategories = await this.subcategoryRepository.find({
          where: { 
            id: In(subcategoria_ids),
            categoria: { id: categoria_id }
          }
        });

        if (subcategories.length !== subcategoria_ids.length) {
          res.status(400).json({ message: 'Una o más subcategorías no son válidas o no pertenecen a la categoría especificada' });
          return;
        }
      }

      // Buscar estado
      const estadoNombre = estado ? 'Activo' : 'Inactivo';
      let estadoEntity = await this.estadoRepository.findOne({
        where: { nombre: estadoNombre }
      });

      if (!estadoEntity) {
        console.log(`⚠️ Estado "${estadoNombre}" no encontrado, buscando estados disponibles...`);
        estadoEntity = await this.estadoRepository.findOne({});
        if (!estadoEntity) {
          res.status(500).json({ message: 'No se encontraron estados disponibles' });
          return;
        }
        console.log(`✅ Usando estado disponible: ${estadoEntity.nombre}`);
      } else {
        console.log(`✅ Estado encontrado: ${estadoEntity.nombre}`);
      }

      // Si hay imagen cargada
      const imagen = req.file ? `uploads/productos/${req.file.filename}` : '';

      // Crear el producto
      const newProduct = this.productRepository.create({
        nombre,
        marca,
        precio: parseFloat(precio.toString()),
        descripcion,
        imagen,
        stock: parseInt(stock.toString()),
        categoria: category,
        estado: estadoEntity
      });

      const savedProduct = await this.productRepository.save(newProduct);
      
      // Agregar subcategorías usando QueryBuilder
      if (subcategories.length > 0) {
        console.log(`📝 Agregando subcategorías al nuevo producto ${savedProduct.id}:`, subcategoria_ids);
        
        await this.productRepository
          .createQueryBuilder()
          .relation(Producto, 'subcategorias')
          .of(savedProduct.id)
          .add(subcategories);
        
        console.log(`✅ Subcategorías agregadas en la base de datos`);
      }
      
      // Recargar para obtener todas las relaciones
      const fullProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['categoria', 'subcategorias', 'estado']
      });

      console.log(`✅ Producto creado con subcategorías:`, fullProduct?.subcategorias?.map(s => ({ id: s.id, nombre: s.nombre })));
      res.status(201).json(this.normalizeProduct(fullProduct!));
    } catch (error) {
      console.error('Error en createProduct:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      });
    }
  };

  public updateProduct = async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de producto inválido' });
        return;
      }

      const { 
        nombre, 
        marca,
        precio, 
        descripcion, 
        stock = 0, 
        estado = true, 
        categoria_id,
        subcategoria_ids: subcategoria_idsRaw = '[]'
      } = req.body;

      // Parsear subcategoria_ids si es string JSON
      let subcategoria_ids: number[] = [];
      try {
        subcategoria_ids = typeof subcategoria_idsRaw === 'string' 
          ? JSON.parse(subcategoria_idsRaw) 
          : (Array.isArray(subcategoria_idsRaw) ? subcategoria_idsRaw : []);
      } catch (e) {
        console.warn('⚠️ Error parsing subcategoria_ids:', e);
        subcategoria_ids = [];
      }

      // Buscar el producto existente
      const existingProduct = await this.productRepository.findOne({
        where: { id },
        relations: ['categoria', 'subcategorias', 'estado']
      });

      if (!existingProduct) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
      }

      // Validar si la categoría existe (si se proporciona)
      let category = existingProduct.categoria;
      if (categoria_id && categoria_id !== existingProduct.categoria.id) {
        const newCategory = await this.categoryRepository.findOne({
          where: { id: categoria_id }
        });
        
        if (!newCategory) {
          res.status(400).json({ message: 'Categoría no válida' });
          return;
        }
        category = newCategory;
      }

      // Validar si las subcategorías existen (si se proporcionan)
      let subcategories: Subcategoria[] = existingProduct.subcategorias || [];
      if (subcategoria_ids !== undefined && Array.isArray(subcategoria_ids)) {
        if (subcategoria_ids.length > 0) {
          subcategories = await this.subcategoryRepository.find({
            where: { 
              id: In(subcategoria_ids),
              categoria: { id: category.id }
            }
          });

          if (subcategories.length !== subcategoria_ids.length) {
            res.status(400).json({ message: 'Una o más subcategorías no son válidas o no pertenecen a la categoría especificada' });
            return;
          }
        } else {
          // Limpiar subcategorías si se envía un array vacío
          subcategories = [];
        }
      }

      // Actualizar los campos proporcionados
      if (nombre !== undefined) existingProduct.nombre = nombre;
      if (marca !== undefined) existingProduct.marca = marca;
      if (precio !== undefined) existingProduct.precio = parseFloat(precio.toString());
      if (descripcion !== undefined) existingProduct.descripcion = descripcion;
      if (stock !== undefined) existingProduct.stock = parseInt(stock.toString());
      if (categoria_id !== undefined) existingProduct.categoria = category;
      
      // Manejar imagen si se proporciona una nueva
      if (req.file) {
        existingProduct.imagen = `uploads/productos/${req.file.filename}`;
      }

      // Actualizar estado si es necesario
      if (estado !== undefined && estado !== null) {
        let estadoId: number;
        
        if (typeof estado === 'boolean') {
          estadoId = estado ? 1 : 2;
        } else if (estado === 'true' || estado === 'false') {
          estadoId = estado === 'true' ? 1 : 2;
        } else if (!isNaN(parseInt(estado.toString()))) {
          estadoId = parseInt(estado.toString());
        } else {
          console.log(`⚠️ Valor de estado inválido: ${estado}, manteniendo estado actual`);
          estadoId = existingProduct.estado.id;
        }
        
        const estadoEntity = await this.estadoRepository.findOne({
          where: { id: estadoId }
        });
        
        if (estadoEntity) {
          existingProduct.estado = estadoEntity;
          console.log(`✅ Estado actualizado a: ${estadoEntity.nombre} (ID: ${estadoId})`);
        } else {
          console.log(`⚠️ Estado con ID ${estadoId} no encontrado, manteniendo estado actual`);
        }
      }

      // Guardar los cambios básicos del producto
      console.log(`📝 Guardando producto ${id}...`);
      const savedProduct = await this.productRepository.save(existingProduct);
      console.log(`✅ Producto guardado, ID: ${savedProduct.id}`);

      // IMPORTANTE: Manejar las subcategorías using QueryBuilder para asegurar persistencia
      if (Array.isArray(subcategoria_ids)) {
        console.log(`📝 Actualizando subcategorías del producto ${id}:`, subcategoria_ids);
        
        // Eliminar todas las relaciones existentes
        await this.productRepository
          .createQueryBuilder()
          .relation(Producto, 'subcategorias')
          .of(savedProduct.id)
          .remove(existingProduct.subcategorias);
        
        // Agregar las nuevas subcategorías
        if (subcategories.length > 0) {
          await this.productRepository
            .createQueryBuilder()
            .relation(Producto, 'subcategorias')
            .of(savedProduct.id)
            .add(subcategories);
        }
        
        console.log(`✅ Subcategorías actualizadas en la base de datos`);
      }
      
      // Recargar para obtener todas las relaciones correctamente desde la BD
      const fullProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['categoria', 'subcategorias', 'estado']
      });

      if (!fullProduct) {
        res.status(500).json({ message: 'Error al recargar el producto actualizado' });
        return;
      }

      console.log(`✅ Producto recargado con subcategorías:`, fullProduct.subcategorias?.map(s => ({ id: s.id, nombre: s.nombre })));
      res.json(this.normalizeProduct(fullProduct));
    } catch (error) {
      console.error('Error en updateProduct:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      });
    }
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID de producto inválido' });
        return;
      }

      const result = await this.productRepository.delete(id);
      
      if (result.affected === 0) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      });
    }
  };

  // Obtener varios productos por IDs (corregido)
  public getProductsByIds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ message: 'Debes enviar un array de IDs' });
        return;
      }
      // Asegurarse de que los IDs sean numéricos
      const numericIds = ids.map((id: any) => Number(id));
      const products = await this.productRepository.find({
        where: { id: In(numericIds) }
      });
      const normalizedProducts = products.map(this.normalizeProduct);
      res.json(normalizedProducts);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  };
}

// Crear instancia del controlador
const productController = new ProductController();

// Exportar métodos para usar en las rutas
export const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds
} = productController;