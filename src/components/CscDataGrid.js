import React, { useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css'
import createLinksAndComputeStats from '@/lib/createLinksAndComputeStats';

const columns = [
  { name: 'cscBooking', header: 'PA', defaultFlex: 1 },
  { name: 'cscName', header: 'Nom', defaultFlex: 1 },
  { name: 'cscSchedType', header: 'Jour', defaultFlex: 1 },
  { name: 'cscScenario', header: 'Sc.', defaultFlex: 1, type: 'number' },
  { name: 'cscDescription', header: 'Description', defaultFlex: 1 },
  { name: 'cscServiceCtxId', header: 'Contexte', defaultFlex: 1 },
  { name: 'cscSchedUnit', header: 'UH', defaultFlex: 1 },
  { name: 'cscOwner', header: 'Propr.', defaultFlex: 1 },
  { name: 'cscUserStamp', header: 'Util.', defaultFlex: 1 },
  { name: 'dateAsIsoString', header: 'Dateur', defaultFlex: 1, type: 'string' },
  { name: 'firstDegreeAdjacents', header: 'Nb. Adj', defaultFlex: 1, type: 'number' },
  { name: 'totalNumberOfAdjacents', header: 'Nb. Total Adj', defaultFlex: 1, type: 'number' },
];

const defaultFilterValue = [
  { name: 'cscBooking', operator: 'contains', type: 'string', value: '' },
  { name: 'cscName', operator: 'contains', type: 'string', value: '' },
  { name: 'cscSchedType', operator: 'contains', type: 'string', value: '' },
  { name: 'cscScenario', operator: 'contains', type: 'string', value: '' },
  { name: 'cscDescription', operator: 'contains', type: 'string', value: '' },
  { name: 'cscServiceCtxId', operator: 'contains', type: 'string', value: '' },
  { name: 'cscSchedUnit', operator: 'contains', type: 'string', value: '' },
  { name: 'cscOwner', operator: 'contains', type: 'string', value: '' },
  { name: 'cscUserStamp', operator: 'contains', type: 'string', value: '' },
  { name: 'dateAsIsoString', operator: 'contains', type: 'string', value: '' },
  { name: 'firstDegreeAdjacents', operator: 'gte', type: 'number', value: '' },
  { name: 'totalNumberOfAdjacents', operator: 'gte', type: 'number', value: '' },
]

const gridStyle = { minHeight: 400, fontFamily: 'sans-serif' }


const CscDataGrid = ({ cscByCscKey, handleDataGridRowClick }) => {
  const allCscs = Object.values(cscByCscKey);
  createLinksAndComputeStats(allCscs);
  const dataSource = allCscs;

  const onRowClick = useCallback((rowProps) => {
    handleDataGridRowClick(rowProps.data.cscKey);
  }, []);

  const onRenderRow = useCallback((rowProps) => {
    const { onClick } = rowProps;

    rowProps.onClick = (event) => {
      onRowClick(rowProps);
      if (onClick) {
        onClick(event);
      }
    };
  }, [])

  return (
    <ReactDataGrid
      columns={columns}
      dataSource={dataSource}
      defaultFilterValue={defaultFilterValue}
      style={gridStyle}
      onRenderRow={onRenderRow}
    />
  );
};

export default CscDataGrid;