import Parser from "./control-file-and-csv-data-parser";
import getAndSetIfRequired from "./getAndSetIfRequired";


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
  const scenariosBySchedTypeByNameByBooking = {};


  let shortKey = 1;
  parent.forEach((parentCsc) => {
    const cscKey = getKeyFromRawCsc(parentCsc);
    fillScenariosBySchedTypeByNameByBooking(scenariosBySchedTypeByNameByBooking, parentCsc);
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
    scenariosBySchedTypeByNameByBooking,
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


function fillScenariosBySchedTypeByNameByBooking(scenariosBySchedTypeByNameByBooking, csc) {
  const { cscName, cscSchedType, cscScenario, cscBooking } = csc;
  const scenarios = getAndSetIfRequired(scenariosBySchedTypeByNameByBooking, [cscBooking, cscName, cscSchedType], []);
  scenarios.push(cscScenario);
}


