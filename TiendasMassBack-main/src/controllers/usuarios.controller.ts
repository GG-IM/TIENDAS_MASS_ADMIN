import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario.entity';
import { Estado } from '../entities/Estado.entity';
import { Rol } from '../entities/Rol.entity';
//JWT
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.key'), 'utf8');

const usuarioRepository = AppDataSource.getRepository(Usuario);
const estadoRepository = AppDataSource.getRepository(Estado);

// Obtener todos los usuarios
export const getAllUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await usuarioRepository.find({
      relations: ['estado'], // Incluye el estado en la respuesta
    });
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// Obtener usuario por ID
export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await usuarioRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['estado'],
    });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      direccion: usuario.direccion,
      telefono: usuario.telefono,
      ciudad: usuario.ciudad,
      codigoPostal: usuario.codigoPostal,
      estado: usuario.estado.nombre,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      email,
      password,
      direccion,
      estadoId = 1,  
      telefono,
      ciudad,
      codigoPostal,
      rolId = 2  
    } = req.body;

    // Validaciones de entrada
    if (!nombre || !email || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
      return;
    }

    // Validación de nombre (2-100 caracteres, solo letras y espacios)
    if (nombre.trim().length < 2) {
      res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' });
      return;
    }
    
    if (nombre.length > 100) {
      res.status(400).json({ message: 'El nombre no puede exceder 100 caracteres' });
      return;
    }
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(nombre)) {
      res.status(400).json({ message: 'El nombre solo puede contener letras y espacios' });
      return;
    }

    // Validación de email (formato y longitud)
    if (email.length > 254) {
      res.status(400).json({ message: 'El correo electrónico no puede exceder 254 caracteres' });
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Formato de correo electrónico inválido' });
      return;
    }

    // Normalizar email (trim y lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Validación de contraseña (6-128 caracteres, mayúscula, minúscula, número, sin espacios)
    if (password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    
    if (password.length > 128) {
      res.status(400).json({ message: 'La contraseña no puede exceder 128 caracteres' });
      return;
    }
    
    if (!/[A-Z]/.test(password)) {
      res.status(400).json({ message: 'La contraseña debe contener al menos una letra mayúscula' });
      return;
    }
    
    if (!/[a-z]/.test(password)) {
      res.status(400).json({ message: 'La contraseña debe contener al menos una letra minúscula' });
      return;
    }
    
    if (!/[0-9]/.test(password)) {
      res.status(400).json({ message: 'La contraseña debe contener al menos un número' });
      return;
    }
    
    if (/\s/.test(password)) {
      res.status(400).json({ message: 'La contraseña no puede contener espacios' });
      return;
    }

    // Validación de dirección (opcional, pero si se llena debe tener 5-200 caracteres)
    if (direccion && direccion.trim().length > 0) {
      if (direccion.trim().length < 5) {
        res.status(400).json({ message: 'La dirección debe tener al menos 5 caracteres' });
        return;
      }
      
      if (direccion.length > 200) {
        res.status(400).json({ message: 'La dirección no puede exceder 200 caracteres' });
        return;
      }
    }

    // Verifica si el usuario ya existe
    const usuarioExistente = await usuarioRepository.findOneBy({ email: normalizedEmail });
    if (usuarioExistente) {
      res.status(400).json({ message: 'El usuario ya existe' });
      return;
    }

    // Busca el rol por ID (más eficiente)
    const rol = await AppDataSource.getRepository(Rol).findOneBy({ id: rolId });
    if (!rol) {
      res.status(400).json({ message: `Rol con ID ${rolId} no encontrado` });
      return;
    }

    // Busca el estado por ID
    const estado = await estadoRepository.findOneBy({ id: estadoId });
    if (!estado) {
      res.status(400).json({ message: `Estado con ID ${estadoId} no encontrado` });
      return;
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el nuevo usuario
    const nuevoUsuario = usuarioRepository.create({
      nombre,
      email: normalizedEmail, // ✅ Guardar email normalizado
      password: hashedPassword,
      direccion,
      estado,
      telefono,
      ciudad,
      codigoPostal,
      rol
    });

    // Guarda en la base de datos
    const usuarioGuardado = await usuarioRepository.save(nuevoUsuario);

    // Respuesta completa con objetos relacionados
    res.status(201).json({
      id: usuarioGuardado.id,
      nombre: usuarioGuardado.nombre,
      email: usuarioGuardado.email,
      direccion: usuarioGuardado.direccion,
      telefono: usuarioGuardado.telefono,
      ciudad: usuarioGuardado.ciudad,
      codigoPostal: usuarioGuardado.codigoPostal,
      estado: {
        id: usuarioGuardado.estado.id,
        nombre: usuarioGuardado.estado.nombre
      },
      rol: {
        id: usuarioGuardado.rol.id,
        nombre: usuarioGuardado.rol.nombre
      }
    });

  } catch (error: any) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Iniciar sesión
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validaciones de entrada
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    // Normalizar email (trim y lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    const usuario = await usuarioRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['estado', 'rol'],
    });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol.nombre
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '2h'
      }
    );

    res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        direccion: usuario.direccion || "",
        telefono: usuario.telefono,
        ciudad: usuario.ciudad,
        codigoPostal: usuario.codigoPostal,
        estado: usuario.estado,
        rol: usuario.rol
      },
      token: token,
      expiresIn: '2h'
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar 
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, ciudad, codigoPostal, estadoId } = req.body;

    const usuario = await usuarioRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ['estado'],
    });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (estadoId !== undefined) {
      const estado = await estadoRepository.findOneBy({ id: estadoId });
      if (!estado) {
        res.status(400).json({ message: 'Estado no válido' });
        return;
      }
      usuario.estado = estado;
    }

    if (nombre !== undefined) usuario.nombre = nombre;
    if (direccion !== undefined) usuario.direccion = direccion;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (ciudad !== undefined) usuario.ciudad = ciudad;
    if (codigoPostal !== undefined) usuario.codigoPostal = codigoPostal;

    const usuarioActualizado = await usuarioRepository.save(usuario);

    res.json({
      message: 'Perfil actualizado correctamente',
      usuario: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        direccion: usuarioActualizado.direccion,
        telefono: usuarioActualizado.telefono,
        ciudad: usuarioActualizado.ciudad,
        codigoPostal: usuarioActualizado.codigoPostal,
        estado: usuarioActualizado.estado.nombre,
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await usuarioRepository.findOneBy({ id: parseInt(id, 10) });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    await usuarioRepository.remove(usuario);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

