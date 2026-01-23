# Integración de Subcategorías - Frontend

## 📋 Descripción General

Se han implementado tres componentes principales para la gestión de subcategorías en el frontend:

1. **SubcategoriaSelector** - Selector de subcategorías (admin)
2. **SubcategoriaFilter** - Filtro de subcategorías (cliente)
3. **SubcategoriaProductos** - Visualización de productos por subcategoría (cliente)

---

## 🎯 1. SubcategoriaSelector (Admin)

### Propósito
Componente select que carga dinámicamente subcategorías cuando se selecciona una categoría en el formulario de productos.

### Ubicación
`/src/components/SubcategoriaSelector.jsx`

### Props
```javascript
{
  categoriaId: string | number,      // ID de categoría seleccionada
  subcategoriaId: string | number,   // ID subcategoría actualmente seleccionada
  onChange: function,                // Callback cuando cambia selección
  isRequired: boolean,               // Si el campo es obligatorio (default: false)
  className: string,                 // Clases CSS adicionales
  disabled: boolean,                 // Desabilitar selector
  showLabel: boolean                 // Mostrar label (default: true)
}
```

### Ejemplo de Uso en GestionProducto.jsx

```jsx
<SubcategoriaSelector 
  categoriaId={formData.categoriaId}
  subcategoriaId={formData.subcategoriaId}
  onChange={(subcategoriaId) => setFormData({ ...formData, subcategoriaId })}
  disabled={loading}
  className="form-group"
/>
```

### Características
- ✅ Carga automática de subcategorías al cambiar categoría
- ✅ Validación de categoría seleccionada
- ✅ Mensajes de estado (cargando, sin opciones, etc.)
- ✅ Deshabilitación condicional
- ✅ Manejo de errores

---

## 🎯 2. SubcategoriaFilter (Cliente)

### Propósito
Componente de filtro de subcategorías para que clientes puedan filtrar productos dentro de una categoría.

### Ubicación
`/src/components/SubcategoriaFilter.jsx`

### Props
```javascript
{
  categoriaId: string | number,      // ID de categoría actual
  onSubcategoriaSelect: function     // Callback con ID de subcategoría seleccionada
}
```

### Ejemplo de Uso en Productos.jsx

```jsx
import SubcategoriaFilter from '../SubcategoriaFilter';

// En el componente
const [subcategoriaId, setSubcategoriaId] = useState('');

// En render
<SubcategoriaFilter 
  categoriaId={categoriaId}
  onSubcategoriaSelect={setSubcategoriaId}
/>
```

### Características
- ✅ Botones de filtro elegantes con estilos visuales
- ✅ Validación de categoría
- ✅ Filtro de "Limpiar" para resetear selección
- ✅ Feedback visual de selección activa
- ✅ Manejo de respuesta vacía

---

## 🎯 3. SubcategoriaProductos (Cliente - Vista Acordeón)

### Propósito
Componente que muestra todas las subcategorías con sus productos en una vista de acordeón expandible.

### Ubicación
`/src/components/SubcategoriaProductos.jsx`

### Props
```javascript
{
  categoriaId: string | number,      // ID de categoría
  onProductClick: function           // Callback cuando se hace clic en producto
}
```

### Ejemplo de Uso

```jsx
import SubcategoriaProductos from '../SubcategoriaProductos';

<SubcategoriaProductos 
  categoriaId={selectedCategoryId}
  onProductClick={(producto) => {
    console.log('Producto seleccionado:', producto);
  }}
/>
```

### Características
- ✅ Vista acordeón con subcategorías expandibles
- ✅ Carga automática de productos por subcategoría
- ✅ Expansión/colapso de secciones
- ✅ Estados de carga
- ✅ Manejo de errores
- ✅ Integración con ProductCard

---

## 📡 API Endpoints Utilizados

### Obtener Subcategorías
```
GET /api/subcategorias/categoria/:categoriaId
```

### Obtener Productos por Subcategoría
```
GET /api/products?subcategoriaId=:subcategoriaId
```

### Obtener Todos los Productos
```
GET /api/products?categoriaId=:categoriaId&subcategoriaId=:subcategoriaId
```

---

## 🔄 Flujo de Integración

### En GestionProducto.jsx (Admin)

```
1. Usuario selecciona categoría
   ↓
2. SubcategoriaSelector carga automáticamente subcategorías
   ↓
3. Usuario selecciona subcategoría (opcional)
   ↓
4. Al guardar, se envía subcategoria_id junto con otros datos
   ↓
5. Backend asocia el producto con la subcategoría
```

### En Productos.jsx (Cliente)

```
1. Categoría seleccionada
   ↓
2. SubcategoriaFilter muestra botones de filtro
   ↓
3. Usuario hace clic en subcategoría
   ↓
4. Productos se filtran automáticamente
   ↓
5. Se cargan solo productos de esa subcategoría
```

---

## 🛠️ Cambios en Archivos Existentes

### GestionProducto.jsx
- ✅ Importación de `SubcategoriaSelector`
- ✅ Añadido `subcategoriaId` al estado `formData`
- ✅ Lógica para resetear subcategoría al cambiar categoría
- ✅ Envío de `subcategoria_id` en POST/PUT
- ✅ Columna de "Subcategoría" en tabla
- ✅ Selector de subcategoría en modal

### Productos.jsx
- ✅ Importación de `SubcategoriaFilter`
- ✅ Estado para `subcategoriaId`
- ✅ Parámetro query `subcategoriaId` en API calls
- ✅ Renderizado de filtro

---

## 📝 Validaciones

### SubcategoriaSelector
- Valida que exista una categoría seleccionada
- Muestra mensaje si no hay subcategorías disponibles
- Deshabilita select cuando no hay datos

### SubcategoriaFilter
- No muestra si categoría es vacía
- Validación de carga exitosa
- Manejo de respuesta vacía

---

## 🎨 Estilos

### SubcategoriaFilter
- Botones con background amarillo cuando están seleccionados
- Estilos hover para mejor UX
- Bordes redondeados (20px)
- Box shadow sutil

### SubcategoriaProductos
- Header amarillo (#ffc107)
- Efecto hover en headers
- Transiciones suaves
- Responsive grid (auto-fill, minmax)

---

## 🚀 Próximos Pasos Recomendados

1. **Integrar en más páginas**: Agregar SubcategoriaFilter en home, búsqueda, etc.
2. **Breadcrumb**: Mostrar ruta completa: Categoría > Subcategoría > Producto
3. **Caché**: Implementar almacenamiento en caché de subcategorías
4. **URLs amigables**: Actualizar URLs para incluir subcategoría
5. **Búsqueda avanzada**: Combinar búsqueda por categoría + subcategoría

---

## 🔧 Troubleshooting

### SubcategoriaSelector no carga subcategorías
- Verificar que `categoriaId` no sea vacío o null
- Revisar que el endpoint `/api/subcategorias/categoria/:categoriaId` responda correctamente
- Verificar CORS en backend

### Productos no se filtran
- Asegurar que `subcategoriaId` se pasa correctamente en query
- Verificar que los productos tienen `subcategoriaId` asignado en BD
- Revisar respuesta del endpoint `/api/products?subcategoriaId=:id`

### Estilos no se aplican
- Verificar que los archivos CSS del proyecto incluyan soporte para grid/flexbox
- Revisar especificidad de estilos CSS existentes

---

## 📞 Soporte

Para dudas o mejoras, revisa:
- Backend: `/src/routes/subcategoria.routes.ts`
- Utilidades API: `/src/utils/subcategoriaAPI.js`
- Documentación completa: `SUBCATEGORIAS_IMPLEMENTATION.md`
