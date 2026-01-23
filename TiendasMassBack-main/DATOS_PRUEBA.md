# 📊 Carga de Datos de Prueba - Subcategorías

## ¿Qué contiene?

He creado **31 subcategorías** y asignado **9 productos** a ellas, basándome en tus categorías y productos existentes.

### Estructura Creada

```
1. ABARROTES (4 subcategorías)
   ├─ Aceites y Grasas
   ├─ Harinas y Cereales
   ├─ Especias y Condimentos
   └─ Enlatados

2. BEBIDAS (3 subcategorías)
   ├─ Bebidas Alcohólicas
   ├─ Bebidas No Alcohólicas
   └─ Agua y Bebidas Isotónicas

3. LÁCTEOS (4 subcategorías)
   ├─ Leches
   ├─ Quesos
   ├─ Yogures
   └─ Mantequilla y Cremas

4. CONFITERÍA (3 subcategorías)
   ├─ Chocolates
   ├─ Dulces y Caramelos
   └─ Golosinas

5. PANADERÍA (3 subcategorías)
   ├─ Pan
   ├─ Pasteles y Bizcochos
   └─ Galletas

6. PIQUEOS (3 subcategorías)
   ├─ Snacks Salados
   ├─ Snacks Dulces
   └─ Frutos Secos

7. LIMPIEZA (4 subcategorías)
   ├─ Limpiadores Multiusos
   ├─ Desinfectantes
   ├─ Detergentes
   └─ Cepillos y Escobas

8. CUIDADO PERSONAL (4 subcategorías)
   ├─ Higiene Dental
   ├─ Cuidado Capilar
   ├─ Higiene Corporal
   └─ Desodorantes
```

---

## 🚀 Cómo Cargar los Datos

### Opción 1: Usar el Script Automatizado (Recomendado)

```bash
cd TiendasMassBack-main

# Hacer el script ejecutable
chmod +x load-test-data.sh

# Ejecutar el script
./load-test-data.sh
```

El script te pedirá:
- Usuario MySQL (default: root)
- Contraseña MySQL
- Base de datos (default: tiendasmass)

---

### Opción 2: Ejecutar Manualmente

**Paso 1: Insertar Subcategorías**
```bash
mysql -u root -p tiendasmass < src/scripts/insert-subcategorias.sql
```

**Paso 2: Actualizar Productos**
```bash
mysql -u root -p tiendasmass < src/scripts/update-productos-subcategorias.sql
```

---

### Opción 3: Copiar y Pegar en Terminal MySQL

Abre tu cliente MySQL:
```bash
mysql -u root -p tiendasmass
```

Copia y pega todo el contenido de:
- `src/scripts/insert-subcategorias.sql`
- `src/scripts/update-productos-subcategorias.sql`

---

## ✅ Verificar la Carga

```bash
mysql -u root -p tiendasmass
```

Luego ejecuta:

```sql
-- Ver cantidad de subcategorías
SELECT COUNT(*) as total_subcategorias FROM Subcategorias;

-- Ver subcategorías con productos
SELECT s.id, s.nombre, c.nombre as categoria, 
       COUNT(p.id) as productos
FROM Subcategorias s
LEFT JOIN Categorias c ON s.categoriaId = c.id
LEFT JOIN Productos p ON p.subcategoriaId = s.id
GROUP BY s.id, s.nombre, c.nombre
ORDER BY c.nombre, s.nombre;

-- Ver productos con subcategoría asignada
SELECT p.id, p.nombre, c.nombre as categoria, s.nombre as subcategoria
FROM Productos p
LEFT JOIN Categorias c ON p.categoriaId = c.id
LEFT JOIN Subcategorias s ON p.subcategoriaId = s.id
WHERE p.subcategoriaId IS NOT NULL
ORDER BY c.nombre, s.nombre;
```

---

## 📋 Archivos Creados

1. **insert-subcategorias.sql** - Inserts de todas las subcategorías
2. **update-productos-subcategorias.sql** - Updates de productos
3. **load-test-data.sh** - Script automatizado (Linux/Mac)
4. **DATOS_PRUEBA.md** - Este archivo

---

## 🔄 Asignaciones Realizadas

| Producto | Categoría | Subcategoría |
|----------|-----------|--------------|
| Aceite de Girasol | Abarrotes | Aceites y Grasas |
| Harina de Trigo | Abarrotes | Harinas y Cereales |
| Cerveza Pilsen | Bebidas | Bebidas Alcohólicas |
| Jugo de Mango | Bebidas | Bebidas No Alcohólicas |
| Leche Entera | Lácteos | Leches |
| Queso Fresco | Lácteos | Quesos |
| Chocolate Negro | Confitería | Chocolates |
| Gomitas Frutales | Confitería | Dulces y Caramelos |
| Pan Integral | Panadería | Pan |

---

## 💡 Próximos Pasos

1. ✅ Ejecuta uno de los scripts de carga
2. ✅ Verifica con las queries SQL
3. ✅ Reinicia el servidor: `npm start`
4. ✅ Prueba el API: `curl http://localhost:5001/api/products`

---

## 🎯 Datos Disponibles

Después de cargar, tendrás:
- ✅ 31 subcategorías
- ✅ 9 productos con subcategorías asignadas
- ✅ Filtrado disponible por subcategoría

---

## 📞 Notas

- Las subcategorías están todas marcadas como **Activo** (estadoId = 1)
- Puedes agregar más subcategorías manualmente si lo deseas
- Los productos sin subcategoría asignada siguen funcionando normalmente
- Las categorías originales se conservan intactas

---

**¡Listo para cargar!** 🚀
