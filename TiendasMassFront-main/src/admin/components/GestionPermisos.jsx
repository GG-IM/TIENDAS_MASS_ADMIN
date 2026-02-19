import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import swal from 'sweetalert2';
import '../styles/GestionPermisos.css';

const API_URL = 'http://localhost:5001';

const GestionPermisos = () => {
  // === Estados del componente ===
  // roles: lista de roles disponibles del backend
  // selectedRoleId/Name: el rol actualmente seleccionado
  // catalogo: lista de módulos y acciones disponibles
  // permisosActuales: permisos guardados en BD del rol seleccionado
  // permisosSeleccionados: permisos marcados en la UI (Set para búsqueda rápida)
  // loading/guardando: controlan los spinners de carga
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [catalogo, setCatalogo] = useState({ modulos: [], acciones: [] });
  const [permisosActuales, setPermisosActuales] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  // === Headers para autenticación en peticiones ===
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // === Al montar el componente, carga roles y catálogo ===
  useEffect(() => {
    fetchRoles();
    fetchCatalogo();
  }, []);

  // === Obtiene lista de roles del backend (GET /api/roles) ===
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/roles`, { headers });
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener los roles.'
      });
    }
  };

  // === Obtiene módulos y acciones disponibles (GET /api/permisos/catalogo) ===
  const fetchCatalogo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/permisos/catalogo`, { headers });
      setCatalogo(response.data);
      // Si el catálogo viene vacío, sugerir seed
      if (!response.data || !response.data.modulos || response.data.modulos.length === 0) {
        swal.fire({
          icon: 'info',
          title: 'Catálogo vacío',
          text: 'No se encontraron módulos en el catálogo. Puedes ejecutar el seed para poblar permisos.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error al obtener catálogo:', error);
      const status = error.response?.status;
      if (status === 401) {
        swal.fire({ icon: 'error', title: 'No autenticado', text: 'Inicia sesión como administrador.' });
      } else if (status === 403) {
        swal.fire({ icon: 'error', title: 'Sin permisos', text: 'Necesitas ser administrador para ver el catálogo.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron obtener los módulos y acciones.' });
      }
    }
  };

  

  // === Obtiene permisos del rol seleccionado (GET /api/permisos/roles/:roleId) ===
  // Convierte el array de permisos a un Set para búsqueda rápida en los checkboxes
  const fetchPermisosRol = async (roleId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/permisos/roles/${roleId}`, { headers });
      
      const { permisos, roleName } = response.data;
      setSelectedRoleName(roleName);
      setPermisosActuales(permisos);
      
      const permisosSet = new Set();
      permisos.forEach(p => {
        permisosSet.add(`${p.modulo}|${p.accion}`);
      });
      setPermisosSeleccionados(permisosSet);
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener los permisos del rol.'
      });
    } finally {
      setLoading(false);
    }
  };

  // === Cuando cambia el rol seleccionado en el dropdown ===
  const handleRoleChange = (e) => {
    const roleId = Number(e.target.value);
    setSelectedRoleId(roleId);
    
    if (roleId) {
      fetchPermisosRol(roleId);
    } else {
      setPermisosActuales([]);
      setPermisosSeleccionados(new Set());
      setSelectedRoleName('');
    }
  };

  // === Toggle de checkbox (marca/desmarca un permiso) ===
  const handlePermisoChange = (modulo, accion) => {
    const key = `${modulo}|${accion}`;
    const newSet = new Set(permisosSeleccionados);
    
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    
    setPermisosSeleccionados(newSet);
  };

  // === Envía permisos al backend (PUT /api/permisos/roles/:roleId) ===
  // Convierte el Set de permisos a array y calcula qué cambió
  const handleGuardarPermisos = async () => {
    if (!selectedRoleId) {
      swal.fire({
        icon: 'warning',
        title: 'Selecciona un rol',
        text: 'Por favor selecciona un rol para asignar permisos.'
      });
      return;
    }

    try {
      setGuardando(true);
      
      const permisos = Array.from(permisosSeleccionados).map(key => {
        const [modulo, accion] = key.split('|');
        return { modulo, accion };
      });

      const response = await axios.put(
        `${API_URL}/api/permisos/roles/${selectedRoleId}`,
        { permisos },
        { headers }
      );

      swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Permisos actualizados para el rol "${selectedRoleName}"`
      });

      setPermisosActuales(permisos);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudieron actualizar los permisos.'
      });
    } finally {
      setGuardando(false);
    }
  };

  // === Botones de control: Restaurar, Seleccionar Todo, Desseleccionar Todo ===
  const handleResetPermisos = () => {
    const permisosSet = new Set();
    permisosActuales.forEach(p => {
      permisosSet.add(`${p.modulo}|${p.accion}`);
    });
    setPermisosSeleccionados(permisosSet);
  };

  const handleSeleccionarTodos = () => {
    const newSet = new Set();
    catalogo.modulos.forEach(modulo => {
      catalogo.acciones.forEach(accion => {
        newSet.add(`${modulo}|${accion}`);
      });
    });
    setPermisosSeleccionados(newSet);
  };

  const handleDeseleccionarTodos = () => {
    setPermisosSeleccionados(new Set());
  };

  // === Helper functions para detectar cambios y contar permisos ===
  const contarPermisosActuales = () => permisosActuales.length;
  const contarPermisosSeleccionados = () => permisosSeleccionados.size;
  const permisosCambiaron = contarPermisosActuales() !== contarPermisosSeleccionados() ||
    !permisosActuales.every(p => permisosSeleccionados.has(`${p.modulo}|${p.accion}`));

  return (
    <div className="gestion-permisos">
      <div className="permisos-header">
        <h1>Gestión de Permisos por Rol</h1>
        <p>Asigna permisos a los roles para controlar el acceso a los módulos y acciones</p>
      </div>

      <div className="permisos-container">
        {/* === Selector de Rol - Dropdown para elegir el rol a configurar === */}
        <div className="rol-selector">
          <label htmlFor="rol-select">Seleccionar Rol:</label>
          <select
            id="rol-select"
            value={selectedRoleId || ''}
            onChange={handleRoleChange}
            disabled={roles.length === 0}
          >
            <option value="">-- Selecciona un rol --</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {/* (Seed removed) */}
        </div>

        {selectedRoleId && (
          <>
            {/* === Info del Rol - Muestra nombre, cantidad de permisos actuales y cambios === */}
            <div className="rol-info">
              <div className="info-item">
                <span className="label">Rol Seleccionado:</span>
                <span className="valor">{selectedRoleName}</span>
              </div>
              <div className="info-item">
                <span className="label">Permisos Actuales:</span>
                <span className="valor">{contarPermisosActuales()}</span>
              </div>
              <div className="info-item">
                <span className="label">Permisos a Guardar:</span>
                <span className={`valor ${permisosCambiaron ? 'changed' : ''}`}>
                  {contarPermisosSeleccionados()}
                </span>
              </div>
            </div>

            {/* === Botones de Control - Seleccionar/Desseleccionar/Restaurar === */}
            <div className="permisos-controles">
              <button
                onClick={handleSeleccionarTodos}
                className="btn-control btn-select-all"
              >
                ✓ Seleccionar Todo
              </button>
              <button
                onClick={handleDeseleccionarTodos}
                className="btn-control btn-deselect-all"
              >
                ✕ Desseleccionar Todo
              </button>
              <button
                onClick={handleResetPermisos}
                className="btn-control btn-reset"
                disabled={!permisosCambiaron}
              >
                <RefreshCw size={16} /> Restaurar
              </button>
            </div>

            {/* === Tabla de Permisos (Matriz) - Módulos vs Acciones con checkboxes === */}
            {loading ? (
              <div className="loading">Cargando permisos...</div>
            ) : (
              <div className="permisos-matriz">
                <table className="table-permisos">
                  <thead>
                    <tr>
                      <th className="modulo-header">Módulo</th>
                      {catalogo.acciones.map(accion => (
                        <th key={accion} className="accion-header">
                          {accion}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catalogo.modulos.map(modulo => (
                      <tr key={modulo} className="modulo-row">
                        <td className="modulo-name">
                          <strong>{modulo}</strong>
                        </td>
                        {catalogo.acciones.map(accion => {
                          const key = `${modulo}|${accion}`;
                          const isChecked = permisosSeleccionados.has(key);
                          const wasChecked = permisosActuales.some(
                            p => p.modulo === modulo && p.accion === accion
                          );
                          const hasChanged = isChecked !== wasChecked;

                          return (
                            <td
                              key={key}
                              className={`permiso-cell ${isChecked ? 'checked' : ''} ${hasChanged ? 'changed' : ''}`}
                            >
                              <label className="checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermisoChange(modulo, accion)}
                                  className="checkbox-input"
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* === Botones Finales - Guardar Permisos e indicador de estado === */}
            <div className="permisos-acciones">
              <button
                onClick={handleGuardarPermisos}
                disabled={!permisosCambiaron || guardando}
                className="btn-guardar"
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar Permisos'}
              </button>
              <div className="estado-permisos">
                {permisosCambiaron ? (
                  <>
                    <AlertCircle size={16} className="icon-warning" />
                    <span>Hay cambios sin guardar</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="icon-success" />
                    <span>Sin cambios</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* === Mensaje cuando no hay rol seleccionado === */}
        {!selectedRoleId && roles.length > 0 && (
          <div className="no-selection">
            <p>Selecciona un rol para gestionar sus permisos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionPermisos;
