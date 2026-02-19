
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Folder, Users, ShoppingCart, Settings, CreditCard, UserPlus, LogOut ,Store, Database, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useUsuario } from '../../context/userContext';

const URL = "http://localhost:5000"; // URL de Azure
const API_URL = "http://localhost:5001";

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useUsuario();
  const [modulosPermitidos, setModulosPermitidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Mapeo de módulos a items del menú
  const allMenuItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home, modulo: 'DASHBOARD' },
    { to: '/admin/productos', label: 'Productos', icon: Package, modulo: 'PRODUCTOS' },
    { to: '/admin/categorias', label: 'Categorías', icon: Folder, modulo: 'CATEGORIAS' },
    { to: '/admin/subcategorias', label: 'Subcategorías', icon: Folder, modulo: 'SUBCATEGORIAS' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users, modulo: 'USUARIOS' },
    { to: '/admin/reportes', label: 'Pedidos', icon: ShoppingCart, modulo: 'PEDIDOS' },
    { to: '/admin/estados', label: 'Estados', icon: Settings, modulo: 'ESTADOS' },
    { to: '/admin/metodos-pago', label: 'Métodos de Pago', icon: CreditCard, modulo: 'METODO_PAGO' },
    { to: '/admin/crear-admin', label: 'Crear Admin', icon: UserPlus, modulo: 'USUARIOS' },
    { to: '/admin/tiendas', label: 'Tiendas', icon: Store, modulo: 'TIENDAS' },
    { to: '/admin/tabla-maestra', label: 'Tabla Maestra', icon: Database, modulo: 'MASTER_TABLE' },
    { to: '/admin/permisos', label: 'Permisos', icon: Lock, modulo: 'MASTER_TABLE' }, // Nueva ruta para permisos
  ];

  // Obtener permisos del usuario
  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const token = getToken();
        if (!token) {
          setCargando(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/permisos/me/modulos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Error al obtener permisos:', response.status);
          setCargando(false);
          return;
        }

        const data = await response.json();
        setModulosPermitidos(data.modulos || []);
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchModulos();
  }, [getToken]);

  // Filtrar items según permisos
  const menuItems = allMenuItems.filter(item => {
    // Si aún está cargando, no mostrar nada
    if (cargando) return false;
    
    // Mostrar item si el módulo está en los permisos
    return modulosPermitidos.includes(item.modulo);
  });

  const handleLogout = () => {
    Swal.fire({
      title: '¿Desea Salir del panel de administrativo?',
      text: '¿Estás seguro de que quieres salir del panel administrativo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar datos de admin
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has salido del panel administrativo',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirigir al home o menú principal
        navigate('/');  // Aquí redirige al home, o menú principal según lo que necesites
      }
    });
  };

  const getAdminInfo = () => {
    try {
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        const userData = JSON.parse(adminUser);
        return {
          nombre: userData.nombre,
          email: userData.email,
          rol: userData.rol?.nombre
        };
      }
    } catch (error) {
      console.error('Error al obtener datos de admin:', error);
    }
    return null;
  };

  const adminInfo = getAdminInfo();

  return (
    <nav className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">M</div>
          {!collapsed && <div className="logo-text">Mass Admin</div>}
        </div>
      </div>

      {/* Información del administrador */}
      {adminInfo && !collapsed && (
        <div className="admin-info">
          <div className="admin-name">{adminInfo.nombre}</div>
          <div className="admin-email">{adminInfo.email}</div>
          <div className="admin-role">{adminInfo.rol}</div>
        </div>
      )}

      <ul className="sidebar-nav">
        {cargando ? (
          <li className="nav-item">
            <span className="nav-text" style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '10px' }}>
              Cargando permisos...
            </span>
          </li>
        ) : menuItems.length === 0 ? (
          <li className="nav-item">
            <span className="nav-text" style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '10px' }}>
              Sin acceso a módulos
            </span>
          </li>
        ) : (
          menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to} className="nav-item">
                <Link
                  to={item.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <IconComponent className="nav-icon" />
                  {!collapsed && <span className="nav-text">{item.label}</span>}
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {/* Botón de logout */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-button custom-logout-button"
          title={collapsed ? 'Cerrar sesión' : ''}
        >
          <LogOut className="nav-icon" />
          {!collapsed && <span className="nav-text">Cerrar Sesión</span>}
        </button>
        <button
          onClick={() => navigate('/')}
          className="logout-button exit-panel-button"
          style={{ marginTop: 8, background: '#f5f5f5', color: '#d35400', border: '1px solid #d35400' }}
          title={collapsed ? 'Salir del panel' : ''}
        >
          <span className="nav-icon" role="img" aria-label="Salir">🚪</span>
          {!collapsed && <span className="nav-text">Salir del panel</span>}
        </button>
      </div>

    </nav>
  );
};

export default Sidebar;
