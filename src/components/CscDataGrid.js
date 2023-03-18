import React, { useEffect, useState } from 'react';
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
]

const gridStyle = { minHeight: 900 }


const CscDataGrid = ({ cscByCscKey }) => {
  const allCscs = Object.values(cscByCscKey);
  createLinksAndComputeStats(allCscs);
  const dataSource = allCscs;

  return (
    <ReactDataGrid
      columns={columns}
      dataSource={dataSource}
      gridStyle={gridStyle}
    />
  );
};

export default CscDataGrid;