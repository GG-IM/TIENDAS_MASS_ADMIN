#!/usr/bin/env node

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Jesus2@36',
  database: process.env.DB_NAME || 'tiendasmass',
};

const args = process.argv.slice(2);
const shouldClean = args.includes('--clean') || args.includes('--reset');

async function seedCustomData() {
  let connection;
  try {
    console.log('🔌 Conectando a la base de datos...');
    console.log(`📡 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`📦 Database: ${dbConfig.database}`);
    console.log(`👤 User: ${dbConfig.user}\n`);

    connection = await mysql.createConnection(dbConfig);

    console.log('🔒 Deshabilitando restricciones de clave foránea...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');

    if (shouldClean) {
      console.log('\n🧹 Limpiando tablas (--clean/--reset detectado)...');
      const tablesToTruncate = ['Producto', 'Categoria', 'Estado', 'MetodoPago', 'MetodoEnvio', 'Rol'];
      for (const table of tablesToTruncate) {
        try {
          await connection.execute(`TRUNCATE TABLE \`${table}\``);
          console.log(`   ✓ Tabla ${table} limpiada`);
        } catch (e) {
          console.warn(`   ⚠️ Error al limpiar tabla ${table}: ${e.message}`);
        }
      }
    }

    // 1. Insertar Roles
    console.log('\n👥 Insertando Roles...');
    const roles = [
      { nombre: 'administrador', descripcion: null },
      { nombre: 'cliente', descripcion: null },
      { nombre: 'vendedor', descripcion: null },
      { nombre: 'Administrador', descripcion: 'Control total del sistema' },
      { nombre: 'Vendedor', descripcion: 'Registra ventas y atiende pedidos' },
      { nombre: 'Almacenero', descripcion: 'Gestiona inventario y almacenes' },
      { nombre: 'Supervisor', descripcion: 'Supervisa operaciones y reportes' }
    ];
    for (const r of roles) {
      try {
        const [exists] = await connection.query('SELECT id FROM Rol WHERE nombre = ?', [r.nombre]);
        if (exists.length === 0) {
          await connection.query('INSERT INTO Rol (nombre, descripcion) VALUES (?, ?)', [r.nombre, r.descripcion]);
          console.log(`   ✓ Rol insertado: ${r.nombre}`);
        } else {
          console.log(`   ⊘ Rol ya existe: ${r.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar rol ${r.nombre}:`, e.message);
      }
    }

    // 2. Insertar Estados
    console.log('\n📊 Insertando Estados...');
    const estados = [
      { nombre: 'Activo', descripcion: 'Disponible para uso' },
      { nombre: 'Inactivo', descripcion: 'No disponible' },
      { nombre: 'Suspendido', descripcion: 'Temporalmente deshabilitado' }
    ];
    for (const est of estados) {
      try {
        const [exists] = await connection.query('SELECT id FROM Estado WHERE nombre = ?', [est.nombre]);
        if (exists.length === 0) {
          await connection.query('INSERT INTO Estado (nombre, descripcion) VALUES (?, ?)', [est.nombre, est.descripcion]);
          console.log(`   ✓ Estado insertado: ${est.nombre}`);
        } else {
          console.log(`   ⊘ Estado ya existe: ${est.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar estado ${est.nombre}:`, e.message);
      }
    }

    // 3. Insertar Categorías
    console.log('\n🏷️ Insertando Categorías...');
    const categorias = [
      { nombre: 'Abarrotes', descripcion: 'Productos de abarrotes variados' },
      { nombre: 'Bebidas', descripcion: 'Bebidas alcohólicas y no alcohólicas' },
      { nombre: 'Lácteos', descripcion: 'Productos lácteos como leche, quesos y yogures' },
      { nombre: 'Confitería', descripcion: 'Dulces, chocolates y golosinas' },
      { nombre: 'Panadería', descripcion: 'Pan y productos de panadería' },
      { nombre: 'Piqueos', descripcion: 'Snacks y aperitivos' },
      { nombre: 'Limpieza', descripcion: 'Productos para limpieza del hogar' },
      { nombre: 'Cuidado Personal', descripcion: 'Productos de higiene y cuidado personal' }
    ];
    for (const cat of categorias) {
      try {
        const [exists] = await connection.query('SELECT id FROM Categoria WHERE nombre = ?', [cat.nombre]);
        if (exists.length === 0) {
          // Buscamos el estado 'Activo'
          const [act] = await connection.query("SELECT id FROM Estado WHERE nombre = 'Activo' LIMIT 1");
          const estadoId = act.length > 0 ? act[0].id : 1;

          await connection.query('INSERT INTO Categoria (nombre, descripcion, estadoId) VALUES (?, ?, ?)', [cat.nombre, cat.descripcion, estadoId]);
          console.log(`   ✓ Categoría insertada: ${cat.nombre}`);
        } else {
          console.log(`   ⊘ Categoría ya existe: ${cat.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar categoría ${cat.nombre}:`, e.message);
      }
    }

    // 4. Insertar Productos
    console.log('\n📦 Insertando Productos...');
    const productos = [
      { nombre: 'Aceite de Girasol', descripcion: 'Aceite de girasol refinado, 1 litro', precio: 18.00, stock: 120, marca: 'La Favorita', imagen: 'uploads/productos/aceite_girasol.jpg', categoria: 'Abarrotes' },
      { nombre: 'Harina de Trigo', descripcion: 'Harina de trigo blanca para todo uso, 1 kg', precio: 7.50, stock: 200, marca: 'Molino Real', imagen: 'uploads/productos/harina_trigo.jpg', categoria: 'Abarrotes' },
      { nombre: 'Cerveza Pilsen', descripcion: 'Cerveza rubia lager, lata 330 ml', precio: 6.50, stock: 150, marca: 'Backus', imagen: 'uploads/productos/cerveza_pilsen.jpg', categoria: 'Bebidas' },
      { nombre: 'Jugo de Mango', descripcion: 'Jugo natural de mango, 1 litro', precio: 4.00, stock: 80, marca: 'Del Valle', imagen: 'uploads/productos/jugo_mango.jpg', categoria: 'Bebidas' },
      { nombre: 'Leche Entera', descripcion: 'Leche entera pasteurizada, 1 litro', precio: 4.50, stock: 180, marca: 'Gloria', imagen: 'uploads/productos/leche_entera.jpg', categoria: 'Lácteos' },
      { nombre: 'Queso Fresco', descripcion: 'Queso fresco de vaca, 500 gramos', precio: 12.00, stock: 90, marca: 'Santa Rosa', imagen: 'uploads/productos/queso_fresco.jpg', categoria: 'Lácteos' },
      { nombre: 'Chocolate Negro', descripcion: 'Chocolate negro 70%, barra 100g', precio: 7.00, stock: 140, marca: 'Nacional', imagen: 'uploads/productos/chocolate_negro.jpg', categoria: 'Confitería' },
      { nombre: 'Gomitas Frutales', descripcion: 'Gomitas de frutas, paquete 150g', precio: 5.00, stock: 110, marca: 'Haribo', imagen: 'uploads/productos/gomitas_frutales.jpg', categoria: 'Confitería' },
      { nombre: 'Pan Integral', descripcion: 'Pan integral rebanado, 500 gramos', precio: 3.00, stock: 130, marca: 'Bimbo', imagen: 'uploads/productos/pan_integral.jpg', categoria: 'Panadería' },
      { nombre: 'Bizcocho', descripcion: 'Bizcocho tradicional, unidad', precio: 6.50, stock: 70, marca: 'La Ibérica', imagen: 'uploads/productos/bizcocho.jpg', categoria: 'Panadería' },
      { nombre: 'Papas Fritas', descripcion: 'Papas fritas clásicas, bolsa 120g', precio: 4.50, stock: 160, marca: 'Lay\'s', imagen: 'uploads/productos/papas_fritas.jpg', categoria: 'Piqueos' },
      { nombre: 'Maní Salado', descripcion: 'Maní salado, bolsa 100g', precio: 3.00, stock: 150, marca: 'Supermaní', imagen: 'uploads/productos/mani_salado.jpg', categoria: 'Piqueos' },
      { nombre: 'Detergente Líquido', descripcion: 'Detergente líquido para ropa, 1 litro', precio: 15.00, stock: 100, marca: 'Ariel', imagen: 'uploads/productos/detergente_ariel.jpg', categoria: 'Limpieza' },
      { nombre: 'Limpiador Multiusos', descripcion: 'Limpiador multiusos para hogar, 500 ml', precio: 10.00, stock: 90, marca: 'Mr. Músculo', imagen: 'uploads/productos/limpiador_mult.jpg', categoria: 'Limpieza' },
      { nombre: 'Jabón de Manos', descripcion: 'Jabón líquido para manos, 250 ml', precio: 6.00, stock: 120, marca: 'Dove', imagen: 'uploads/productos/jabon_dove.jpg', categoria: 'Cuidado Personal' },
      { nombre: 'Champú Anticaspa', descripcion: 'Champú anticaspa, 400 ml', precio: 18.00, stock: 85, marca: 'Head & Shoulders', imagen: 'uploads/productos/champu_hs.jpg', categoria: 'Cuidado Personal' }
    ];
    for (const prod of productos) {
      try {
        const [exists] = await connection.query('SELECT id FROM Producto WHERE nombre = ?', [prod.nombre]);
        if (exists.length === 0) {
          // Buscamos el ID de la categoría por su nombre
          const [cat] = await connection.query('SELECT id FROM Categoria WHERE nombre = ? LIMIT 1', [prod.categoria]);
          const categoriaId = cat.length > 0 ? cat[0].id : null;

          if (!categoriaId) {
            console.warn(`   ⚠️ Categoría "${prod.categoria}" no encontrada para el producto "${prod.nombre}". Saltando.`);
            continue;
          }

          // Buscamos el estado 'Activo'
          const [act] = await connection.query("SELECT id FROM Estado WHERE nombre = 'Activo' LIMIT 1");
          const estadoId = act.length > 0 ? act[0].id : 1;

          await connection.query(
            `INSERT INTO Producto (nombre, descripcion, precio, stock, marca, imagen, categoriaId, estadoId) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prod.nombre, prod.descripcion, prod.precio, prod.stock, prod.marca, prod.imagen, categoriaId, estadoId]
          );
          console.log(`   ✓ Producto insertado: ${prod.nombre}`);
        } else {
          console.log(`   ⊘ Producto ya existe: ${prod.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar producto ${prod.nombre}:`, e.message);
      }
    }

    // 5. Métodos de Pago
    console.log('\n💳 Insertando Métodos de Pago...');
    const metodosPago = [
      { nombre: 'Efectivo', comision: 0.00, descripcion: 'Pago directo en efectivo' },
      { nombre: 'Tarjeta de Crédito', comision: 3.50, descripcion: 'Pago con tarjeta de crédito' },
      { nombre: 'Yape/Plin', comision: 0.00, descripcion: 'Pago con billetera móvil' }
    ];
    for (const mp of metodosPago) {
      try {
        const [exists] = await connection.query('SELECT id FROM MetodoPago WHERE nombre = ?', [mp.nombre]);
        if (exists.length === 0) {
          await connection.query('INSERT INTO MetodoPago (nombre, comision, descripcion) VALUES (?, ?, ?)', [mp.nombre, mp.comision, mp.descripcion]);
          console.log(`   ✓ Método de pago insertado: ${mp.nombre}`);
        } else {
          console.log(`   ⊘ Método de pago ya existe: ${mp.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar método de pago ${mp.nombre}:`, e.message);
      }
    }

    // 6. Métodos de Envío
    console.log('\n🚚 Insertando Métodos de Envío...');
    const metodosEnvio = [
      { nombre: 'Envío estándar', descripcion: 'Entrega en 3-5 días hábiles', precio: 10.00 },
      { nombre: 'Envío express', descripcion: 'Entrega en 24-48 horas', precio: 20.00 },
      { nombre: 'Recojo en tienda', descripcion: 'Recojo en punto autorizado', precio: 0.00 }
    ];
    for (const me of metodosEnvio) {
      try {
        const [exists] = await connection.query('SELECT id FROM MetodoEnvio WHERE nombre = ?', [me.nombre]);
        if (exists.length === 0) {
          await connection.query('INSERT INTO MetodoEnvio (nombre, descripcion, precio) VALUES (?, ?, ?)', [me.nombre, me.descripcion, me.precio]);
          console.log(`   ✓ Método de envío insertado: ${me.nombre}`);
        } else {
          console.log(`   ⊘ Método de envío ya existe: ${me.nombre}`);
        }
      } catch (e) {
        console.error(`   ❌ Error al insertar método de envío ${me.nombre}:`, e.message);
      }
    }

    console.log('\n🔒 Rehabilitando restricciones de clave foránea...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');

    console.log('\n✨ ¡Proceso de seeding completado correctamente!');
    if (!shouldClean) {
      console.log('💡 Consejo: Puedes usar la bandera --clean o --reset para limpiar las tablas antes de sembrar.');
    }
  } catch (error) {
    console.error('\n❌ Error fatal durante el seeding:', error.message);
    if (connection) {
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS=1');
      } catch (_) {}
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión a la base de datos cerrada.');
    }
  }
}

seedCustomData();
