// src/app.ts
import "dotenv/config"; // 👈 Esto debe ir primero

import express from "express";
import cors from "cors";
import path from "path";
import { AppDataSource } from "./config/data-source";

// === RUTAS PRINCIPALES ===
import usuariosRoutes from "./routes/usuarios.routes";
import productRoutes from "./routes/productos.routes";
import categoriRoutes from "./routes/categoria.routes";
import pedidoRoutes from "./routes/pedidos.routes";
import MetodoPagoRoutes from "./routes/metodopago.routes";
import metodoEnvioRoutes from "./routes/metodoenvio.routes";
import rolesRoutes from "./routes/rol.routes";
import estadoRoutes from "./routes/estado.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import direccionRoutes from "./routes/direccion.routes";
import tarjetaUsuarioRoutes from "./routes/tarjeta-usuario.routes";
import authRoutes from "./routes/auth.routes";
import setupRoutes from "./routes/setup.routes";
import tiendaRoutes from "./routes/tienda.routes";

// === MERCADO PAGO ===
import mpRoutes from "./routes/payments.mp"; // /preference y /preference/health
import mpWebhook from "./routes/payments.webhook"; // /webhook (GET/POST)

const app = express();
const PORT = process.env.PORT || 443 || "https://6bcbe0fa91fe.ngrok-free.app";

// === MIDDLEWARE ===
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://6bcbe0fa91fe.ngrok-free.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === ESTÁTICOS ===
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// === RUTAS DE MERCADO PAGO ===
//  GET  /api/payments/mp/preference/health
//  POST /api/payments/mp/preference
//  POST /api/payments/mp/webhook
//  GET  /api/payments/mp/webhook
app.use("/api/payments/mp", mpRoutes);
app.use("/api/payments/mp", mpWebhook);

// === RUTAS GENERALES ===
app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categorias", categoriRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/metodos-pago", MetodoPagoRoutes);
app.use("/api/metodos-envio", metodoEnvioRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/estados", estadoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/direcciones", direccionRoutes);
app.use("/api/tarjetas-usuario", tarjetaUsuarioRoutes);
//NUEVO PARA TIENDA--JIM
app.use("/api/tiendas", tiendaRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Bienvenido a TiendasMass API. Backend corriendo con éxito.");
});

// Health check endpoint
app.get("/health", (_req, res) => {
  const isDbInitialized = AppDataSource.isInitialized;
  res.status(isDbInitialized ? 200 : 503).json({
    status: isDbInitialized ? "ok" : "database-not-initialized",
    database_connected: isDbInitialized,
    timestamp: new Date().toISOString(),
  });
});

// Diagnostics endpoint
app.get("/api/diagnostics", async (_req, res) => {
  try {
    const isDbInitialized = AppDataSource.isInitialized;
    if (!isDbInitialized) {
      res.status(503).json({
        status: "error",
        database: "not_initialized",
      });
      return;
    }

    const categoryRepo = AppDataSource.getRepository("Categoria");
    const count = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM Categorias`
    );

    res.json({
      status: "ok",
      database: "connected",
      categorias_count: count[0]?.count || 0,
      tables_check: {
        categorias: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      error_message: error?.message,
      error_code: error?.code,
    });
  }
});

// === CONEXIÓN BD Y SERVER ===
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexión a la base de datos exitosa");
    console.log("📊 Database:", AppDataSource.options.database);
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(
        `🌐 BASE_URL: ${process.env.BASE_URL || "http://localhost:5000"}`
      );
      console.log(`✅ Rutas disponibles:`);
      console.log(`   - GET  /health`);
      console.log(`   - GET  /api/categorias`);
      console.log(`   - POST /api/categorias`);
      console.log(`   - GET  /api/products`);
      console.log(`   - GET  /api/pedidos`);
    });
  })
  .catch((error: any) => {
    console.error("❌ Error al conectar con la base de datos:", error);
    console.error("Detalles:", {
      message: error?.message,
      code: error?.code,
      sqlState: error?.sqlState,
    });
    process.exit(1);
  });

export default app;
