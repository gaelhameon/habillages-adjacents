import Parser from "./control-file-and-csv-data-parser";

export async function parseAndCleanData(data) {
  const { newControlFile, newDataFiles } = data;
  const [dataFile] = newDataFiles;
  const oirParser = new Parser(
    dataFile.fileData,
    newControlFile.fileData,
    { convertItemNamesToCamel: true, convertKeysToCamel: true },
    null,
  );
  await oirParser.init();
  const oirStyleData = await oirParser.parseDataFile();

  const { parent } = oirStyleData;

  const uniqueCscObjectByCscKey = {};
  const keyPartSets = [
    new Set(),
    new Set(),
    new Set(),
    new Set(),
  ]

  let shortKey = 1;
  parent.forEach((parentCsc) => {
    const cscKey = getKeyFromRawCsc(parentCsc);
    fillSets(keyPartSets, parentCsc);
    parentCsc.cscKey = cscKey;
    parentCsc.shortKey = shortKey;
    shortKey += 1;
    uniqueCscObjectByCscKey[cscKey] = parentCsc;
  });

  Object.values(uniqueCscObjectByCscKey).forEach((csc) => {
    csc.uniqueAdjacents = csc.adjacent.map((rawAdj) => uniqueCscObjectByCscKey[getKeyFromRawCsc(rawAdj)]);
    delete csc.adjacent;
  });


  return {
    cscByCscKey: uniqueCscObjectByCscKey,
    bookings: Array.from(keyPartSets[0]).sort(),
    names: Array.from(keyPartSets[1]).sort(),
    scenarios: Array.from(keyPartSets[2]).sort(),
    schedTypes: Array.from(keyPartSets[3]).sort(),
  };
}


function getKeyFromRawCsc(rawCsc) {
  const { cscName, cscSchedType, cscScenario, cscBooking } = rawCsc;
  const cscKey = [
    cscBooking,
    cscName,
    cscSchedType,
    cscScenario,
  ].join('-');
  return cscKey;
}

function fillSets(keyPartSets, csc) {
  const { cscName, cscSchedType, cscScenario, cscBooking } = csc;

  const [bookings, names, scenarios, schedTypes] = keyPartSets;
  bookings.add(cscBooking);
  names.add(cscName);
  scenarios.add(cscScenario);
  schedTypes.add(cscSchedType);
}
