import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Subcategoria } from "../entities/Subcategoria.entity";
import { Categoria } from "../entities/Categoria.entity";

export const getAllSubcategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      res.status(503).json({ message: "La base de datos no está inicializada" });
      return;
    }

    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);
    const subcategories = await subcategoryRepository.find({
      relations: ["estado", "categoria", "productos"],
    });

    console.log("✅ Subcategorías encontradas:", subcategories.length);
    res.json(subcategories);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al obtener subcategorías:", errorMessage);
    res.status(500).json({
      message: "Error al obtener las subcategorías",
      error: errorMessage,
    });
  }
};

export const getSubcategoriesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoriaId } = req.params;
    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);

    const subcategories = await subcategoryRepository.find({
      where: { categoria: { id: parseInt(categoriaId) } },
      relations: ["estado", "categoria", "productos"],
    });

    res.json(subcategories);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al obtener subcategorías por categoría:", errorMessage);
    res.status(500).json({
      message: "Error al obtener subcategorías por categoría",
      error: errorMessage,
    });
  }
};

export const getSubcategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);

    const subcategory = await subcategoryRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["estado", "categoria", "productos"],
    });

    if (!subcategory) {
      res.status(404).json({ message: "Subcategoría no encontrada" });
      return;
    }

    res.json(subcategory);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ message: errorMessage });
  }
};

export const createSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nombre, descripcion, categoriaId, estado } = req.body;

    if (!nombre || nombre.trim() === "") {
      res
        .status(400)
        .json({ message: "El nombre de la subcategoría es requerido" });
      return;
    }

    if (!categoriaId) {
      res.status(400).json({ message: "El ID de la categoría es requerido" });
      return;
    }

    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);
    const categoryRepository = AppDataSource.getRepository(Categoria);

    // Verificar que la categoría existe
    const category = await categoryRepository.findOne({
      where: { id: parseInt(categoriaId) },
    });

    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }

    // Verificar si ya existe una subcategoría con el mismo nombre en esta categoría
    const existingSubcategory = await subcategoryRepository.findOne({
      where: {
        nombre: nombre.trim(),
        categoria: { id: parseInt(categoriaId) },
      },
    });

    if (existingSubcategory) {
      res.status(409).json({
        message: "Ya existe una subcategoría con ese nombre en esta categoría",
      });
      return;
    }

    const subcategoryData: any = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      categoria: { id: parseInt(categoriaId) },
    };

    // Estado por defecto: Activo (ID 1)
    if (estado && !isNaN(parseInt(estado))) {
      subcategoryData.estado = { id: parseInt(estado) };
    } else {
      subcategoryData.estado = { id: 1 };
    }

    const newSubcategory = subcategoryRepository.create(subcategoryData);
    const savedSubcategory = (await subcategoryRepository.save(
      newSubcategory
    )) as unknown as Subcategoria;

    // Recargar con relaciones
    const subcategoryWithRelations = await subcategoryRepository.findOne({
      where: { id: savedSubcategory.id },
      relations: ["productos", "estado", "categoria"],
    });

    res.status(201).json(subcategoryWithRelations);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al crear subcategoría:", errorMessage);
    res.status(500).json({ message: errorMessage });
  }
};

export const updateSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;
    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);

    const subcategory = await subcategoryRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["productos", "estado", "categoria"],
    });

    if (!subcategory) {
      res.status(404).json({ message: "Subcategoría no encontrada" });
      return;
    }

    // Actualizar nombre si se proporciona
    if (nombre !== undefined && nombre !== null) {
      subcategory.nombre = nombre.trim();
    }

    // Actualizar descripción si se proporciona
    if (descripcion !== undefined) {
      subcategory.descripcion = descripcion?.trim() || null;
    }

    // Actualizar estado si se proporciona
    if (estado !== undefined && estado !== null) {
      if (typeof estado === "boolean") {
        subcategory.estado = { id: estado ? 1 : 2 } as any;
      } else if (estado === "true" || estado === "false") {
        subcategory.estado = { id: estado === "true" ? 1 : 2 } as any;
      } else if (!isNaN(parseInt(estado))) {
        subcategory.estado = { id: parseInt(estado) } as any;
      }
    }

    const updatedSubcategory = await subcategoryRepository.save(subcategory);

    // Recargar con relaciones
    const subcategoryWithRelations = await subcategoryRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["productos", "estado", "categoria"],
    });

    res.json(subcategoryWithRelations);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al actualizar subcategoría:", errorMessage);
    res.status(500).json({ message: errorMessage });
  }
};

export const deleteSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const subcategoryRepository = AppDataSource.getRepository(Subcategoria);

    const subcategory = await subcategoryRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!subcategory) {
      res.status(404).json({ message: "Subcategoría no encontrada" });
      return;
    }

    await subcategoryRepository.remove(subcategory);
    res.json({ message: "Subcategoría eliminada correctamente" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al eliminar subcategoría:", errorMessage);
    res.status(500).json({ message: errorMessage });
  }
};
