import React, { useState } from 'react';
import '../../styles/GestionMasterTable.css';
import MasterTableModal from './MasterTableModal';

const GestionMasterTable = () => {
  // Datos mock - puede ser reemplazado con datos del backend
  const [masterTableData, setMasterTableData] = useState([
    {
      idMasterTable: 100,
      idMasterTableParent: null,
      value: null,
      description: 'Sexo colaborador',
      name: 'Sexo',
      order: 0,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    },
    {
      idMasterTable: 101,
      idMasterTableParent: 100,
      value: 'M',
      description: 'Sexo masculino',
      name: 'Masculino',
      order: 1,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    },
    {
      idMasterTable: 102,
      idMasterTableParent: 100,
      value: 'F',
      description: 'Sexo femenino',
      name: 'Femenino',
      order: 2,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    },
    {
      idMasterTable: 200,
      idMasterTableParent: null,
      value: null,
      description: 'Tipo documento',
      name: 'TipoDocumento',
      order: 0,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    },
    {
      idMasterTable: 201,
      idMasterTableParent: 200,
      value: 'DNI',
      description: 'Doc. Nacional Id.',
      name: 'Doc_Nacional',
      order: 1,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    },
    {
      idMasterTable: 202,
      idMasterTableParent: 200,
      value: 'PT',
      description: 'Pasaporte',
      name: 'Pasaporte',
      order: 2,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      userNew: 'ADMIN',
      dateNew: '2025/01/30',
      userEdit: '–',
      dateEdit: '–',
      state: 'A'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [expandedParents, setExpandedParents] = useState(new Set([100, 200]));

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

  const handleSave = (formData) => {
    if (editingData) {
      // Actualizar existente
      setMasterTableData(
        masterTableData.map((item) =>
          item.idMasterTable === editingData.idMasterTable ? formData : item
        )
      );
    } else {
      // Crear nuevo
      const newId = Math.max(...masterTableData.map((d) => d.idMasterTable)) + 1;
      setMasterTableData([...masterTableData, { ...formData, idMasterTable: newId }]);
    }
    closeModal();
  };

  const handleDelete = (idMasterTable) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      setMasterTableData(
        masterTableData.filter((item) => item.idMasterTable !== idMasterTable)
      );
    }
  };

  // Organizar datos en estructura jerárquica
  const getHierarchicalData = () => {
    const parentItems = masterTableData.filter((item) => item.idMasterTableParent === null);
    return parentItems;
  };

  const getChildrenItems = (parentId) => {
    return masterTableData.filter((item) => item.idMasterTableParent === parentId);
  };

  return (
    <div className="gestion-master-table-container">
      <div className="master-table-header">
        <h2>Gestión de Tabla Maestra</h2>
        <button
          className="btn btn-primary"
          onClick={() => openModal()}
        >
          + Nuevo Registro
        </button>
      </div>

      <div className="master-table-wrapper">
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
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(parentItem.idMasterTable)}
                        title="Eliminar"
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
                          >
                            ✎
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(childItem.idMasterTable)}
                            title="Eliminar"
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
      </div>

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
