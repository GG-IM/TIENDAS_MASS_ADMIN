# Guía de Subcategorías - TiendasMass

## 📋 Descripción

Se ha implementado un nuevo sistema de subcategorías en la tienda. Ahora es posible organizar los productos en una jerarquía de dos niveles: **Categorías** → **Subcategorías** → **Productos**.

## 🏗️ Estructura Implementada

### Entidades
- **Subcategoria.entity.ts** - Nueva entidad para subcategorías
- **Categoria.entity.ts** - Actualizada con relación a subcategorías
- **Producto.entity.ts** - Actualizada con relación a subcategorías
- **Estado.entity.ts** - Actualizada con relación a subcategorías

### Controladores
- **subcategoria.controller.ts** - Controlador CRUD completo para subcategorías

### Rutas
- **subcategoria.routes.ts** - Rutas API para subcategorías

### Servicios
- **subcategoria.service.ts** - Servicio con métodos auxiliares

## 📡 API Endpoints

### Base URL
```
/api/subcategorias
```

### Operaciones Disponibles

#### 1. Obtener todas las subcategorías
```http
GET /api/subcategorias
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Electrónica de Consumo",
    "descripcion": "Descripción opcional",
    "categoria": {
      "id": 1,
      "nombre": "Electrónica",
      "estado": { "id": 1 }
    },
    "estado": { "id": 1, "nombre": "Activo" },
    "productos": []
  }
]
```

#### 2. Obtener subcategorías por categoría
```http
GET /api/subcategorias/categoria/:categoriaId
```

**Ejemplo:**
```http
GET /api/subcategorias/categoria/1
```

#### 3. Obtener subcategoría por ID
```http
GET /api/subcategorias/:id
```

**Ejemplo:**
```http
GET /api/subcategorias/1
```

#### 4. Crear nueva subcategoría
```http
POST /api/subcategorias
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Laptops",
  "descripcion": "Computadoras portátiles",
  "categoriaId": 1,
  "estado": 1
}
```

**Campos:**
- `nombre` (string, requerido) - Nombre de la subcategoría
- `descripcion` (string, opcional) - Descripción de la subcategoría
- `categoriaId` (number, requerido) - ID de la categoría padre
- `estado` (number, opcional) - ID del estado (por defecto 1 = Activo)

#### 5. Actualizar subcategoría
```http
PUT /api/subcategorias/:id
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Laptops Gaming",
  "descripcion": "Computadoras portátiles para gaming",
  "estado": 1
}
```

**Campos (todos opcionales):**
- `nombre` - Nuevo nombre
- `descripcion` - Nueva descripción
- `estado` - Nuevo estado

#### 6. Eliminar subcategoría
```http
DELETE /api/subcategorias/:id
```

## 🗄️ Cambios en Base de Datos

### Nueva Tabla: `Subcategorias`
```sql
CREATE TABLE Subcategorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  categoriaId INT NOT NULL,
  estadoId INT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoriaId) REFERENCES Categorias(id) ON DELETE CASCADE,
  FOREIGN KEY (estadoId) REFERENCES Estados(id)
);
```

### Actualización Tabla: `Productos`
Se agregó la columna:
```sql
ALTER TABLE Productos ADD COLUMN subcategoriaId INT;
ALTER TABLE Productos ADD FOREIGN KEY (subcategoriaId) REFERENCES Subcategorias(id) ON DELETE SET NULL;
```

## 🔄 Relaciones de Datos

```
Estado
  ├── Categorias (estado: Estado)
  │   └── Subcategorias (estado: Estado)
  │       ├── categoria: Categoria
  │       ├── estado: Estado
  │       └── productos: Producto[]
  └── Productos (estado: Estado)
      ├── categoria: Categoria
      ├── subcategoria: Subcategoria (opcional)
      └── estado: Estado
```

## 📝 Ejemplos de Uso

### Crear una estructura completa

#### 1. Crear categoría
```bash
curl -X POST http://localhost:5001/api/categorias \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Electrónica", "descripcion": "Productos electrónicos"}'
```

#### 2. Crear subcategoría
```bash
curl -X POST http://localhost:5001/api/subcategorias \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptops",
    "descripcion": "Computadoras portátiles",
    "categoriaId": 1,
    "estado": 1
  }'
```

#### 3. Crear producto con subcategoría
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Dell XPS",
    "descripcion": "Laptop gaming potente",
    "precio": 1500.00,
    "stock": 10,
    "marca": "Dell",
    "categoriaId": 1,
    "subcategoriaId": 1,
    "estado": 1
  }'
```

## 🛠️ Script de Migración

Si necesita crear la tabla manualmente, ejecute:

```bash
mysql -u root -p tiendasmass < src/scripts/create-subcategorias.sql
```

O ejecute el SQL directamente en su cliente MySQL/MariaDB.

## ✨ Características

✅ CRUD completo de subcategorías  
✅ Validación de datos  
✅ Relaciones con categorías y estados  
✅ Soporte para productos con subcategorías  
✅ Métodos de filtrado por categoría  
✅ Servicio reutilizable  
✅ Manejo de errores robusto  

## 🔍 Consideraciones Importantes

1. **Jerarquía**: Los productos pueden pertenecer a una categoría con o sin subcategoría
2. **Cascada**: Eliminar una categoría eliminará todas sus subcategorías (CASCADE)
3. **Eliminación de productos**: Eliminar una subcategoría pone `subcategoriaId` en NULL en los productos
4. **Estados**: Las subcategorías usan el mismo sistema de estados que categorías (Activo/Inactivo)

## 📚 Archivos Modificados

- ✏️ `src/entities/Categoria.entity.ts` - Agregada relación con subcategorías
- ✏️ `src/entities/Producto.entity.ts` - Agregada relación con subcategorías
- ✏️ `src/entities/Estado.entity.ts` - Agregada relación con subcategorías
- ✏️ `src/app.ts` - Importadas rutas de subcategorías
- ✨ `src/entities/Subcategoria.entity.ts` - Nuevo archivo
- ✨ `src/controllers/subcategoria.controller.ts` - Nuevo archivo
- ✨ `src/routes/subcategoria.routes.ts` - Nuevo archivo
- ✨ `src/services/subcategoria.service.ts` - Nuevo archivo
- ✨ `src/scripts/create-subcategorias.sql` - Script SQL de migración

## 🚀 Próximos Pasos

1. Compilar el proyecto: `npm run build`
2. Ejecutar migraciones de base de datos
3. Reiniciar el servidor
4. Comenzar a usar los endpoints de subcategorías

## 📞 Soporte

Para dudas o problemas, revise los logs del servidor para más detalles sobre cualquier error.
