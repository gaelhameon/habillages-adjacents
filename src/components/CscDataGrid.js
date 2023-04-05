import React, { useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css'
import createLinksAndComputeStats from '@/lib/createLinksAndComputeStats';


const headerProps = {
  style: { fontSize: '10px' }
};
const columns = [
  { name: 'cscBooking', header: 'PA', defaultFlex: 1, headerProps },
  { name: 'cscName', header: 'Nom', defaultFlex: 1, headerProps },
  { name: 'cscSchedType', header: 'Jour', defaultFlex: 1, headerProps },
  { name: 'cscScenario', header: 'Sc.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'cscDescription', header: 'Description', defaultFlex: 1, headerProps },
  { name: 'cscServiceCtxId', header: 'Contexte', defaultFlex: 1, headerProps },
  { name: 'cscSchedUnit', header: 'UH', defaultFlex: 1, headerProps },
  { name: 'cscOwner', header: 'Propr.', defaultFlex: 1, headerProps },
  { name: 'cscUserStamp', header: 'Util.', defaultFlex: 1, headerProps },
  { name: 'dateAsIsoString', header: 'Dateur', defaultFlex: 1, type: 'string', headerProps },
  { name: 'firstDegreeAdjacents', header: 'Nb. Adj', defaultFlex: 1, type: 'number', headerProps },
  { name: 'totalNumberOfAdjacents', header: 'Nb. Total Adj', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfLowDepthAdjacents', header: 'Nb. Adj "proches"', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfDatesInCalAfterThresholdDate', header: 'Nb. Dates dans Cal', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfOldSaveDateAdjacents', header: 'Nb de "vieux" adjacents', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfOldSaveDateAndLowDepthAdjacents', header: 'Nb de "vieux" adjacents "proches"', defaultFlex: 1, type: 'number', headerProps },
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
  { name: 'numberOfLowDepthAdjacents', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfDatesInCalAfterThresholdDate', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfOldSaveDateAdjacents', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfOldSaveDateAndLowDepthAdjacents', operator: 'gte', type: 'number', value: '' },
]

const gridStyle = { minHeight: 400, fontFamily: 'sans-serif' }


const CscDataGrid = ({ cscByCscKey, schedulingUnitDatesByCscKey = {}, handleDataGridRowClick,
  thresholdDepth, oldSaveThresholdDate, calendarThresholdDate }) => {
  const allCscs = Object.values(cscByCscKey);
  createLinksAndComputeStats(allCscs, schedulingUnitDatesByCscKey, { thresholdDepth, oldSaveThresholdDate, calendarThresholdDate });
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