import React, { useState, useEffect } from 'react';

const MasterTableModal = ({ isOpen, data, masterTableData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    idMasterTableParent: null,
    value: '',
    description: '',
    name: '',
    order: 0,
    additionalOne: '–',
    additionalTwo: '–',
    additionalThree: '–',
    state: 'A'
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      resetForm();
    }
  }, [data, isOpen]);

  const resetForm = () => {
    setFormData({
      idMasterTableParent: null,
      value: '',
      description: '',
      name: '',
      order: 0,
      additionalOne: '–',
      additionalTwo: '–',
      additionalThree: '–',
      state: 'A'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' || name === 'idMasterTableParent' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const parentOptions = masterTableData.filter((item) => item.idMasterTableParent === null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{data ? 'Editar Registro' : 'Nuevo Registro'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="master-table-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Sexo, TipoDocumento"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Ej: Sexo colaborador"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idMasterTableParent">Tabla Padre (opcional)</label>
              <select
                id="idMasterTableParent"
                name="idMasterTableParent"
                value={formData.idMasterTableParent || ''}
                onChange={handleChange}
              >
                <option value="">-- Ninguno (es tabla principal) --</option>
                {parentOptions.map((item) => (
                  <option key={item.idMasterTable} value={item.idMasterTable}>
                    {item.idMasterTable} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="value">Valor</label>
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="Ej: M, DNI, PT"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="order">Orden</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="additionalOne">Adicional 1</label>
              <input
                type="text"
                id="additionalOne"
                name="additionalOne"
                value={formData.additionalOne}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalTwo">Adicional 2</label>
              <input
                type="text"
                id="additionalTwo"
                name="additionalTwo"
                value={formData.additionalTwo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="additionalThree">Adicional 3</label>
              <input
                type="text"
                id="additionalThree"
                name="additionalThree"
                value={formData.additionalThree}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {data ? 'Guardar Cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterTableModal;
