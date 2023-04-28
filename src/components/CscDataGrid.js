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
  { name: 'firstDegreeIncomingLoadCscs', header: 'Nb. Adj Ent.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'totalNumberOfIncomingLoadCscs', header: 'Nb. Total Adj Ent.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfLowDepthIncoming', header: 'Nb. Adj Ent. "proches"', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfDatesInCalAfterThresholdDate', header: 'Nb. Dates dans Cal', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfOldSaveDateIncoming', header: 'Nb de "vieux" adjacents ent.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'numberOfOldSaveDateAndLowDepthIncoming', header: 'Nb de "vieux" adjacents ent. "proches"', defaultFlex: 1, type: 'number', headerProps },
  { name: 'firstDegreeOutgoingLoadCscs', header: 'Nb Adj Sort.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'totalNumberOfOutgoingLoadCscs', header: 'Nb Total Adj Sort.', defaultFlex: 1, type: 'number', headerProps },
  { name: 'firstDegreeOutgoingToOtherBookings', header: 'Nb adj sort autres reg', defaultFlex: 1, type: 'number', headerProps },
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
  { name: 'firstDegreeIncomingLoadCscs', operator: 'gte', type: 'number', value: '' },
  { name: 'totalNumberOfIncomingLoadCscs', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfLowDepthIncoming', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfDatesInCalAfterThresholdDate', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfOldSaveDateIncoming', operator: 'gte', type: 'number', value: '' },
  { name: 'numberOfOldSaveDateAndLowDepthIncoming', operator: 'gte', type: 'number', value: '' },
  { name: 'firstDegreeOutgoingLoadCscs', operator: 'gte', type: 'number', value: '' },
  { name: 'totalNumberOfOutgoingLoadCscs', operator: 'gte', type: 'number', value: '' },
  { name: 'firstDegreeOutgoingToOtherBookings', operator: 'gte', type: 'number', value: '' },

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