import { useState } from 'react';

/**
 * Hook custom para gestionar los datos de la Tabla Maestra
 * Puede ser reemplazado con llamadas a API cuando el backend esté listo
 */
export const useMasterTable = () => {
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

  const addRecord = (formData) => {
    const newId = Math.max(...masterTableData.map((d) => d.idMasterTable)) + 1;
    setMasterTableData([
      ...masterTableData,
      {
        ...formData,
        idMasterTable: newId,
        userNew: localStorage.getItem('adminUser')
          ? JSON.parse(localStorage.getItem('adminUser')).nombre
          : 'ADMIN',
        dateNew: new Date().toLocaleDateString('es-PE'),
      }
    ]);
  };

  const updateRecord = (idMasterTable, formData) => {
    setMasterTableData(
      masterTableData.map((item) =>
        item.idMasterTable === idMasterTable
          ? {
              ...formData,
              userEdit: localStorage.getItem('adminUser')
                ? JSON.parse(localStorage.getItem('adminUser')).nombre
                : 'ADMIN',
              dateEdit: new Date().toLocaleDateString('es-PE'),
            }
          : item
      )
    );
  };

  const deleteRecord = (idMasterTable) => {
    setMasterTableData(
      masterTableData.filter((item) => item.idMasterTable !== idMasterTable)
    );
  };

  const getHierarchicalData = () => {
    return masterTableData.filter((item) => item.idMasterTableParent === null);
  };

  const getChildrenItems = (parentId) => {
    return masterTableData.filter((item) => item.idMasterTableParent === parentId);
  };

  return {
    masterTableData,
    addRecord,
    updateRecord,
    deleteRecord,
    getHierarchicalData,
    getChildrenItems,
  };
};
