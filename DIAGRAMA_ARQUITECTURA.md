# 📊 Diagrama de Arquitectura - Subcategorías

## 🏗️ Estructura de Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                      SISTEMA DE TIENDAS                     │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌─────────────────┐      ┌──────────────────┐    ┌─────────────┐  │
│  │    CATEGORÍA    │      │   SUBCATEGORÍA   │    │   ESTADO    │  │
│  ├─────────────────┤      ├──────────────────┤    ├─────────────┤  │
│  │ id              │──┐   │ id               │    │ id          │  │
│  │ nombre          │  │   │ nombre           │    │ nombre      │  │
│  │ descripción     │  └──→│ descripción      │    │ descripción │  │
│  │ estado          │      │ categoriaId      │    │ color       │  │
│  └─────────────────┘      │ estadoId         │────│ orden       │  │
│        ▲                  │                  │    │ activo      │  │
│        │                  └──────────────────┘    └─────────────┘  │
│        │                         ▲                       ▲          │
│        │                         │                       │          │
│    (1:N)                     (1:N)                    (1:N)         │
│        │                         │                       │          │
│        └─────────────────────────┴───────────────────────┘          │
│                                                                       │
│  ┌─────────────────┐                                                │
│  │    PRODUCTO     │                                                │
│  ├─────────────────┤                                                │
│  │ id              │                                                │
│  │ nombre          │                                                │
│  │ precio          │                                                │
│  │ stock           │                                                │
│  │ marca           │                                                │
│  │ imagen          │                                                │
│  │ categoriaId     │───→ ┌─────────────────┐                       │
│  │ subcategoriaId  │───→ │  SUBCATEGORÍA   │                       │
│  │ estadoId        │     └─────────────────┘                       │
│  └─────────────────┘                                                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
CLIENTE HTTP
    │
    ▼
┌─────────────────────────────────────────┐
│         EXPRESS ROUTES                  │
│  /api/subcategorias/...                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    SUBCATEGORIA CONTROLLER              │
│  - getAllSubcategories()                │
│  - getSubcategoriesByCategory()         │
│  - getSubcategoryById()                 │
│  - createSubcategory()                  │
│  - updateSubcategory()                  │
│  - deleteSubcategory()                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    TYPEORM REPOSITORY                   │
│  - find()                               │
│  - findOne()                            │
│  - create()                             │
│  - save()                               │
│  - remove()                             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         MYSQL DATABASE                  │
│  Tabla: Subcategorias                   │
└─────────────────────────────────────────┘
```

## 📋 Operaciones CRUD

```
CREATE (POST /api/subcategorias)
├── Validar nombre
├── Verificar categoría existe
├── Comprobar no existe duplicado
├── Crear subcategoría
└── Retornar con relaciones

READ (GET /api/subcategorias)
├── GET todos
├── GET por categoría
└── GET por ID

UPDATE (PUT /api/subcategorias/:id)
├── Buscar subcategoría
├── Actualizar campos
├── Validar cambios
└── Guardar cambios

DELETE (DELETE /api/subcategorias/:id)
├── Buscar subcategoría
├── Eliminar
├── Productos → subcategoriaId = NULL
└── Confirmar eliminación
```

## 🔐 Validaciones

```
Crear Subcategoría:
  ✓ Nombre: no vacío, máx 255 caracteres
  ✓ Categoría: debe existir
  ✓ Duplicado: nombre único por categoría
  ✓ Estado: válido (Activo/Inactivo)

Actualizar Subcategoría:
  ✓ Subcategoría: debe existir
  ✓ Nombre: no vacío (si se proporciona)
  ✓ Estado: válido (si se proporciona)

Eliminar Subcategoría:
  ✓ Subcategoría: debe existir
  ✓ Productos: desvincularse automáticamente
```

## 📡 Ejemplo de Respuesta API

```json
{
  "id": 1,
  "nombre": "Laptops",
  "descripcion": "Computadoras portátiles",
  "categoria": {
    "id": 1,
    "nombre": "Electrónica"
  },
  "estado": {
    "id": 1,
    "nombre": "Activo",
    "color": "#28a745"
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Laptop Dell XPS",
      "precio": 1500.00,
      "stock": 10
    },
    {
      "id": 2,
      "nombre": "Laptop HP Pavilion",
      "precio": 1200.00,
      "stock": 5
    }
  ]
}
```

## 🔗 Jerarquía Completa

```
┌─ Estado (Activo/Inactivo)
│
├─ Categoría
│  ├─ Nombre
│  ├─ Descripción
│  ├─ Estado ──────┐
│  │               │
│  └─ Subcategorías
│     ├─ Nombre     │
│     ├─ Descripción │
│     ├─ Estado ────┤
│     │             │
│     └─ Productos  │
│        ├─ Nombre  │
│        ├─ Precio  │
│        ├─ Stock   │
│        ├─ Marca   │
│        └─ Estado ─┘
│
└─ Productos sin Subcategoría
   ├─ Nombre
   ├─ Precio
   ├─ Stock
   ├─ Marca
   └─ Estado
```

## 🗄️ Diagrama Entidad-Relación

```
           Categorías
              │
              │ 1:N
              │
        Subcategorías
              │
        ┌─────┴─────┐
        │           │
      1:N         1:N
        │           │
    Productos    Estado

Relaciones:
─ Categoría → Subcategoría (1:N, Cascade Delete)
─ Subcategoría → Producto (1:N, Set Null)
─ Subcategoría → Estado (N:1)
─ Producto → Categoría (N:1)
─ Producto → Subcategoría (N:1, Nullable)
─ Producto → Estado (N:1)
```

## 📊 Estadísticas de Implementación

```
Archivos Creados:        8
Archivos Modificados:    5
Líneas de Código:        1500+
Endpoints:               6
Operaciones:             6 (C,R,R,R,U,D)
Validaciones:            10+
Relaciones:              6
Índices BD:              3
Tests Postman:           6
Documentos:              5
```

## 🎯 Matriz de Características

```
                           Backend  Frontend  Testing
Entidades TypeORM            ✓         -        ✓
Controlador CRUD             ✓         -        ✓
Routes API                   ✓         -        ✓
Validaciones                 ✓         -        ✓
Manejo de Errores            ✓         -        ✓
Relaciones BD                ✓         -        ✓
Cliente API                  ✓         ✓        -
Componentes React            ✓         ✓        -
Hooks Personalizados         ✓         ✓        -
Pruebas Postman              ✓         -        ✓
Documentación                ✓         ✓        ✓
```

## 🔄 Ciclo de Vida de una Subcategoría

```
1. CREACIÓN
   ├─ POST /api/subcategorias
   ├─ Validaciones
   ├─ Guardar en BD
   └─ Retornar creada

2. LECTURA
   ├─ GET /api/subcategorias
   ├─ GET /api/subcategorias/categoria/:id
   ├─ GET /api/subcategorias/:id
   └─ Cargar con relaciones

3. ACTUALIZACIÓN
   ├─ PUT /api/subcategorias/:id
   ├─ Modificar campos
   ├─ Guardar cambios
   └─ Retornar actualizada

4. ELIMINACIÓN
   ├─ DELETE /api/subcategorias/:id
   ├─ Desvinculación de productos
   ├─ Eliminar de BD
   └─ Confirmar

5. FILTRADO
   ├─ Por categoría
   ├─ Por estado
   ├─ Por nombre
   └─ Combinaciones
```

---

**Diagrama generado para TiendasMass - Sistema de Subcategorías**
