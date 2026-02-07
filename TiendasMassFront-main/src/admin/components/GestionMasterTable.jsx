import React, { useState } from 'react';
import '../../styles/GestionMasterTable.css';
import MasterTableModal from './MasterTableModal';
import { useMasterTable } from '../../hooks/useMasterTable';

const GestionMasterTable = () => {
  const { masterTableData, addRecord, updateRecord, deleteRecord, loading, error, refetch } = useMasterTable();

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [expandedParents, setExpandedParents] = useState(new Set());

  const toggleExpand = (parentId) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const openModal = (data = null) => {
    setEditingData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingData(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingData) {
        // Actualizar existente
        await updateRecord(editingData.idMasterTable, formData);
      } else {
        // Crear nuevo
        await addRecord(formData);
      }
      closeModal();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleDelete = (idMasterTable) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      deleteRecord(idMasterTable).catch((err) => {
        alert('Error al eliminar: ' + err.message);
      });
    }
  };

  // Organizar datos en estructura jerárquica
  const getHierarchicalData = () => {
    return masterTableData.filter((item) => item.idMasterTableParent === null);
  };

  const getChildrenItems = (parentId) => {
    return masterTableData.filter((item) => item.idMasterTableParent === parentId);
  };

  return (
    <div className="gestion-master-table-container">
      <div className="master-table-header">
        <h2>Gestión de Tabla Maestra</h2>
        <div className="header-actions">
          {loading && <span className="loading-indicator">Cargando...</span>}
          <button
            className="btn btn-primary"
            onClick={() => openModal()}
            disabled={loading}
          >
            + Nuevo Registro
          </button>
          <button
            className="btn btn-secondary"
            onClick={refetch}
            disabled={loading}
            title="Recargar datos"
          >
            ↻ Recargar
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ Error: {error}
          <button onClick={refetch} className="btn-retry">Reintentar</button>
        </div>
      )}

      {loading && masterTableData.length === 0 ? (
        <div className="loading-placeholder">
          <p>Cargando tabla maestra...</p>
        </div>
      ) : (
        <>
          <div className="master-table-wrapper">
            {masterTableData.length === 0 ? (
              <div className="empty-state">
                <p>No hay registros en la tabla maestra</p>
                <button className="btn btn-primary" onClick={() => openModal()}>
                  + Crear primer registro
                </button>
              </div>
            ) : (
              <table className="master-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Valor</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Creado por</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getHierarchicalData().map((parentItem) => (
                    <React.Fragment key={parentItem.idMasterTable}>
                      <tr className="parent-row">
                        <td>
                          <button
                            className="expand-btn"
                            onClick={() => toggleExpand(parentItem.idMasterTable)}
                          >
                            {expandedParents.has(parentItem.idMasterTable) ? '▼' : '▶'}
                          </button>
                          {parentItem.idMasterTable}
                        </td>
                        <td className="name-cell">
                          <strong>{parentItem.name}</strong>
                        </td>
                        <td>{parentItem.description}</td>
                        <td className="value-cell">{parentItem.value || '-'}</td>
                        <td className="order-cell">{parentItem.order}</td>
                        <td>
                          <span className={`badge badge-${parentItem.state === 'A' ? 'success' : 'danger'}`}>
                            {parentItem.state === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{parentItem.userNew}</td>
                        <td>{parentItem.dateNew}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => openModal(parentItem)}
                              title="Editar"
                              disabled={loading}
                            >
                              ✎
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(parentItem.idMasterTable)}
                              title="Eliminar"
                              disabled={loading}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedParents.has(parentItem.idMasterTable) &&
                        getChildrenItems(parentItem.idMasterTable).map((childItem) => (
                          <tr key={childItem.idMasterTable} className="child-row">
                            <td className="child-id">
                              {childItem.idMasterTable}
                            </td>
                            <td className="name-cell">
                              <span className="child-name">{childItem.name}</span>
                            </td>
                            <td>{childItem.description}</td>
                            <td className="value-cell">{childItem.value || '-'}</td>
                            <td className="order-cell">{childItem.order}</td>
                            <td>
                              <span className={`badge badge-${childItem.state === 'A' ? 'success' : 'danger'}`}>
                                {childItem.state === 'A' ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>{childItem.userNew}</td>
                            <td>{childItem.dateNew}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-icon btn-edit"
                                  onClick={() => openModal(childItem)}
                                  title="Editar"
                                  disabled={loading}
                                >
                                  ✎
                                </button>
                                <button
                                  className="btn-icon btn-delete"
                                  onClick={() => handleDelete(childItem.idMasterTable)}
                                  title="Eliminar"
                                  disabled={loading}
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showModal && (
        <MasterTableModal
          isOpen={showModal}
          data={editingData}
          masterTableData={masterTableData}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default GestionMasterTable;
