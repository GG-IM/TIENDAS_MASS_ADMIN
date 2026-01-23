# ⚡ Quick Start - Subcategorías (3 Minutos)

## 🎯 Objetivo
Verificar que la integración de subcategorías funciona correctamente.

---

## 1️⃣ Asegúrate de que todo esté ejecutándose

```bash
# Terminal 1: Backend
cd TiendasMassBack-main
npm start

# Debe mostrar:
# ✅ Server is running on port 5001
# ✅ AppDataSource initialized
```

```bash
# Terminal 2: Frontend
cd TiendasMassFront-main
npm start

# Debe abrir navegador en http://localhost:3000
```

---

## 2️⃣ Prueba el Admin (1 min)

### Panel de Productos
1. Abre: http://localhost:3000/admin/productos
2. Haz clic en **"+ Agregar Producto"**
3. Rellena campos:
   - Nombre: `Mi Producto`
   - Categoría: `Abarrotes` ← Selecciona esta

   **Verifica aquí**: 👇
   - ¿Aparece automáticamente un select de **Subcategoría**?
   - ¿Se cargan opciones como "Aceites y Grasas", "Harinas y Cereales"?

4. Selecciona: `Aceites y Grasas`
5. Rellena resto de datos y haz clic en **"Guardar"**

### ✅ Éxito Si:
- Producto aparece en tabla
- En columna "Subcategoría" dice "Aceites y Grasas"

---

## 3️⃣ Prueba la Tienda (1 min)

### Página de Productos
1. Abre: http://localhost:3000 (o página con productos)
2. Selecciona categoría: `Abarrotes`
3. **Verifica aquí**: 👇
   - ¿Aparecen botones de filtro amarillos?
   - ¿Dicen "Aceites y Grasas", "Harinas y Cereales", etc?

4. Haz clic en: `Aceites y Grasas`
5. **Verifica aquí**: 👇
   - ¿Se resalta el botón?
   - ¿Cambian los productos mostrados?
   - ¿Aparecen solo productos de esa subcategoría?

6. Haz clic en "Limpiar" (si aparece)
7. **Verifica**: Se muestran todos los productos nuevamente

---

## 4️⃣ Tests Rápidos en Navegador (1 min)

### Abrir Developer Tools (F12)

```javascript
// En consola, copia y ejecuta:

// Test 1: Verificar que SubcategoriaFilter se renderiza
console.log(document.querySelector('[id="subcategoriaId"]') ? '✅ Selector presente' : '❌ Selector no encontrado');

// Test 2: Verificar botones de filtro
const botones = document.querySelectorAll('button').length;
console.log(`Total de botones en página: ${botones}`);

// Test 3: Verificar que API responde
fetch('http://localhost:5001/api/subcategorias/categoria/1')
  .then(r => r.json())
  .then(data => console.log('✅ API responde. Subcategorías:', data.length))
  .catch(e => console.error('❌ Error API:', e));
```

---

## 5️⃣ Checklist Final

- [ ] Backend ejecutándose sin errores
- [ ] Frontend compila y se abre
- [ ] SubcategoriaSelector aparece en admin
- [ ] SubcategoriaFilter aparece en tienda
- [ ] Crear producto con subcategoría funciona
- [ ] Filtro de productos funciona
- [ ] Tabla admin muestra columna de subcategoría
- [ ] Estilos se ven bien (colores, botones)

---

## ❌ Si Algo No Funciona

### Subcategorías no cargan
```
1. Abre F12 → Console
2. ¿Hay errores rojo?
3. Abre F12 → Network
4. Filtra por "subcategorias"
5. ¿La request es 200 o error?

Si error: Backend no está ejecutándose o BD sin datos
```

### Productos no se filtran
```
1. Abre F12 → Network
2. Haz clic en botón de filtro
3. ¿Se envía request con parámetro subcategoriaId?
4. ¿Qué responde el servidor?

Si vacío: No hay productos con esa subcategoría
```

### Estilos raros
```
1. Los componentes tienen estilos inline
2. Si se ve feo, es un problema de CSS global
3. Intenta limpiar caché: Ctrl+Shift+R (o Cmd+Shift+R)
```

---

## 🎯 Datos Reales en BD

```sql
-- Verifica que los datos existen:

SELECT COUNT(*) FROM Subcategorias;
-- Debe retornar: 28

SELECT COUNT(*) FROM Productos WHERE subcategoriaId IS NOT NULL;
-- Debe retornar: 9

SELECT p.nombre, s.nombre FROM Productos p 
JOIN Subcategorias s ON p.subcategoriaId = s.id 
LIMIT 5;
-- Debe mostrar productos con subcategorías
```

---

## 🚀 Todo Funciona

Si pasaste todos los tests:

### ✅ Estás listo para:
1. Integrar en más páginas
2. Personalizar estilos
3. Agregar más productos
4. Crear más subcategorías
5. Ir a producción

---

## 📞 Recursos Rápidos

| Necesito | Archivo |
|----------|---------|
| Guía técnica | `FRONTEND_SUBCATEGORIAS_GUIDE.md` |
| Verificación completa | `CHECKLIST_INTEGRACION_FRONTEND.md` |
| Resumen visual | `INTEGRACION_SUBCATEGORIAS_RESUMEN.md` |
| Ejemplos de código | `CatalogoPageEjemplo.jsx` |
| Resumen final | `RESUMEN_FINAL_FRONTEND.md` |

---

## 🎉 ¡Listo!

Took ~3 minutos? ✅
Todo funciona? ✅
¿Feliz? 🎊

**¡Disfruta de las subcategorías!**

---

*Last Updated: 22 de Enero de 2026*  
*Status: ✅ READY FOR PRODUCTION*
