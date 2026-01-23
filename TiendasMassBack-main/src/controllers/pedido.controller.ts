// src/controllers/pedido.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Pedido, EstadoPedido, EstadoPago } from "../entities/Pedidos.entity";
import { DetallePedido } from "../entities/DetallePedido.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Producto } from "../entities/Producto.entity";
import { MetodoPago } from "../entities/MetodoPago.entity";
import { MetodoEnvio } from "../entities/MetodoEnvio.entity";

export const crearPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("INICIO crearPedido", req.body);

    const {
      usuarioId,
      direccionEnvio = "",
      metodoPagoId,
      detalles = [],
      montoTotal,
      deliveryType,        // 'delivery' | 'pickup'
      metodoEnvioId        // opcional
    } = req.body;

    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const productoRepo = AppDataSource.getRepository(Producto);
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const detalleRepo = AppDataSource.getRepository(DetallePedido);
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const metodoEnvioRepo = AppDataSource.getRepository(MetodoEnvio);

    // --- Usuario
    const usuario = await usuarioRepo.findOneBy({ id: Number(usuarioId) });
    console.log("Usuario encontrado:", usuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // --- Método de pago
    const metodoPago = await metodoPagoRepo.findOneBy({ id: Number(metodoPagoId) });
    console.log("Método de pago encontrado:", metodoPago);
    if (!metodoPago) return res.status(400).json({ error: "Método de pago inválido" });

    // --- Validar que haya productos
    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ error: "El pedido debe contener al menos un producto" });
    }

    // --- Método de envío (flexible)
    let metodoEnvio: MetodoEnvio | null = null;
    if (deliveryType === "delivery") {
      if (metodoEnvioId) {
        metodoEnvio = await metodoEnvioRepo.findOneBy({ id: Number(metodoEnvioId) });
      } else {
        // toma el primero disponible como default
        metodoEnvio = await metodoEnvioRepo.findOne({ where: {}, order: { id: "ASC" } });
      }
      console.log("Método de envío encontrado:", metodoEnvio);
      if (!metodoEnvio) return res.status(400).json({ error: "Método de envío inválido" });
    } else {
      // pickup: sin método de envío y costo 0
      metodoEnvio = null;
      console.log("Pickup: sin método de envío");
    }

    // --- Calcular subtotal y verificar stock (no descontamos aún)
    let subtotalCalculado = 0;
    console.log('📦 Detalles del pedido:', detalles);
    for (const det of detalles) {
      const producto = await productoRepo.findOneBy({ id: Number(det.productoId) });
      console.log("Producto encontrado:", producto);
      if (!producto || producto.stock < Number(det.cantidad)) {
        return res.status(400).json({ error: `Producto sin stock o inválido (ID ${det.productoId})` });
      }
      const precioNum = Number(producto.precio);
      console.log(`Producto ${det.productoId}: precio=${precioNum}, cantidad=${det.cantidad}, subtotal=${precioNum * Number(det.cantidad)}`);
      subtotalCalculado += precioNum * Number(det.cantidad);
    }
    subtotalCalculado = Number(subtotalCalculado.toFixed(2));

    // --- Impuestos y envío (8% + envío real o 0 si pickup)
    const impuestos = Number((subtotalCalculado * 0.08).toFixed(2));
    const envio = deliveryType === "delivery" ? Number(metodoEnvio!.precio) : 0; // <-- a número
    const base = Number((subtotalCalculado + impuestos + envio).toFixed(2));

    // --- Comisión del método de pago (si existe)
    const porcentaje = metodoPago?.comision != null ? Number(metodoPago.comision) / 100 : 0;
    const comision = Number((base * porcentaje).toFixed(2));

    // --- Monto esperado (el que vamos a guardar)
    const montoEsperado = Number((base + comision).toFixed(2));

    console.log('🧮 Cálculo de totales en backend:', {
      subtotalCalculado,
      impuestos,
      envio,
      comision,
      montoEsperado,
      montoTotalRecibido: Number(montoTotal),
      deliveryType,
      metodoPagoComision: metodoPago?.comision,
      metodoEnvio: metodoEnvio ? { id: metodoEnvio.id, nombre: metodoEnvio.nombre, precio: metodoEnvio.precio } : null,
      metodoPago: metodoPago ? { id: metodoPago.id, nombre: (metodoPago as any).nombre, comision: metodoPago.comision } : null
    });

    // Validación con tolerancia de 1 centavo
    if (Math.abs(Number(montoTotal) - Number(montoEsperado)) > 0.01) {
      return res.status(400).json({
        error: `El monto total enviado (${Number(montoTotal).toFixed(2)}) no coincide con el calculado (${montoEsperado.toFixed(2)}).`
      });
    }

    // --- Crear pedido (guardamos el monto calculado)
    const nuevoPedido = pedidoRepo.create({
      usuario,
      direccionEnvio,
      metodoPago,
      shippingMethod: metodoEnvio,                   // null si pickup
      estado: EstadoPedido.PENDIENTE,
      montoTotal: montoEsperado,                     // guardamos el correcto
      estadoPago: EstadoPago.PENDIENTE,
      fechaEnvio: null
    });

    const pedidoGuardado = await pedidoRepo.save(nuevoPedido);
    console.log("Pedido creado con ID:", pedidoGuardado.id);

    // --- Descontar stock y crear detalles (después de guardar pedido)
    for (const det of detalles) {
      const producto = await productoRepo.findOneBy({ id: Number(det.productoId) });
      if (!producto) {
        return res.status(400).json({ error: `Producto con ID ${det.productoId} no encontrado` });
      }
      // descuenta stock
      producto.stock = Number(producto.stock) - Number(det.cantidad);
      await productoRepo.save(producto);

      const nuevoDetalle = detalleRepo.create({
        pedido: pedidoGuardado,
        producto,
        cantidad: Number(det.cantidad),
        precio: Number(producto.precio)
      });
      await detalleRepo.save(nuevoDetalle);
    }

    // Respuesta compacta para el front
    return res.status(201).json({
      mensaje: "Pedido creado con éxito",
      pedidoId: pedidoGuardado.id,
      estado_pago: pedidoGuardado.estadoPago
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el pedido" });
  }
};

export const obtenerPedidos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedidos = await pedidoRepo.find({
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago", "shippingMethod"]
    });
    return res.json(pedidos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

export const obtenerPedidoPorId = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOne({
      where: { id: Number(id) },
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago", "shippingMethod"]
    });

    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    // Exponemos estado_pago y estadoPago para polling del front
    return res.json({
      id: pedido.id,
      estado: pedido.estado,
      estado_pago: pedido.estadoPago,
      estadoPago: pedido.estadoPago,
      montoTotal: Number(pedido.montoTotal),
      direccionEnvio: pedido.direccionEnvio,
      usuario: pedido.usuario
        ? {
            id: pedido.usuario.id,
            nombre: pedido.usuario.nombre,
            email: pedido.usuario.email
          }
        : null,
      metodoPago: pedido.metodoPago
        ? {
            id: pedido.metodoPago.id,
            nombre: (pedido.metodoPago as any).nombre,
            tipo: (pedido.metodoPago as any).tipo ?? null,
            comision: (pedido.metodoPago as any).comision ?? null
          }
        : null,
      shippingMethod: pedido.shippingMethod
        ? {
            id: pedido.shippingMethod.id,
            nombre: pedido.shippingMethod.nombre,
            precio: Number(pedido.shippingMethod.precio)
          }
        : null,
      detallesPedidos: (pedido.detallesPedidos || []).map((d) => ({
        id: d.id,
        cantidad: d.cantidad,
        precio: Number(d.precio),
        producto: d.producto ? { id: d.producto.id, nombre: d.producto.nombre } : null
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el pedido" });
  }
};

export const actualizarEstadoPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOneBy({ id: Number(id) });
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    if (!Object.values(EstadoPedido).includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    pedido.estado = estado;
    const pedidoActualizado = await pedidoRepo.save(pedido);
    return res.json(pedidoActualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar el estado del pedido" });
  }
};

export const eliminarPedido = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedido = await pedidoRepo.findOneBy({ id: Number(id) });
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

    await pedidoRepo.remove(pedido);
    return res.json({ mensaje: "Pedido eliminado con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el pedido" });
  }
};

export const obtenerPedidosPorUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { usuarioId } = req.params;

    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    const usuario = await usuarioRepo.findOneBy({ id: Number(usuarioId) });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const pedidos = await pedidoRepo.find({
      where: { usuario: { id: Number(usuarioId) } },
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago"],
      order: { id: "DESC" }
    });

    return res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      },
      pedidos
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener los pedidos del usuario" });
  }
};

export const obtenerEstadisticasPedidos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pedidoRepo = AppDataSource.getRepository(Pedido);
    const pedidos = await pedidoRepo.find({
      relations: ["usuario", "detallesPedidos", "detallesPedidos.producto", "metodoPago"]
    });

    const totalPedidos = pedidos.length;
    const ventasTotales = pedidos.reduce((sum, p) => sum + Number(p.montoTotal), 0);

    const estadisticasPorEstado: Record<string, number> = {
      pendiente: 0,
      confirmado: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };

    pedidos.forEach((p) => {
      estadisticasPorEstado[p.estado] = (estadisticasPorEstado[p.estado] || 0) + 1;
    });

    const totalArticulos = pedidos.reduce(
      (sum, p) => sum + p.detallesPedidos.reduce((acc, d) => acc + d.cantidad, 0),
      0
    );

    return res.json({
      totalPedidos,
      ventasTotales: Number(ventasTotales.toFixed(2)),
      estadisticasPorEstado,
      totalArticulos,
      pedidos
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas de pedidos" });
  }
};
