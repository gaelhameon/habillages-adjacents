import Parser from "./control-file-and-csv-data-parser";
import getAndSetIfRequired from "./getAndSetIfRequired";




export async function parseAndCleanCscData(data, oldSaveThresholdDate) {
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


  const dateTimeMatcher = /^(\d\d)\/(\d\d)\/(\d{4}) +(\d\d?):(\d\d)(?:;(\d\d)\.\d)?$/
  let shortKey = 1;
  parent.forEach((parentCsc) => {
    const cscKey = getKeyFromRawCsc(parentCsc);
    fillScenariosBySchedTypeByNameByBooking(scenariosBySchedTypeByNameByBooking, parentCsc);
    parentCsc.cscKey = cscKey;
    parentCsc.shortKey = shortKey;
    parentCsc.regionLetter = parentCsc.cscSchedUnit.slice(0, 1);

    const match = dateTimeMatcher.exec(parentCsc.cscDatetimeStamp);
    if (!match) throw new Error(`Mauvais format de date: ${parentCsc.cscDatetimeStamp}`);
    const [_, day, month, year, hours, minutes, seconds = 0] = match;
    parentCsc.dateAsDate = new Date(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    parentCsc.dateAsIsoString = parentCsc.dateAsDate.toISOString();
    parentCsc.isOld = parentCsc.dateAsDate < oldSaveThresholdDate;
    shortKey += 1;
    uniqueCscObjectByCscKey[cscKey] = parentCsc;
  });

  Object.values(uniqueCscObjectByCscKey).forEach((csc) => {
    csc.incomingLoadCscs = csc.adjacent.map((rawAdj) => uniqueCscObjectByCscKey[getKeyFromRawCsc(rawAdj)]);
    delete csc.adjacent;
    csc.incomingLoadCscs.forEach((incomingLoadCsc) => {
      const outgoingLoadCscs = getAndSetIfRequired(incomingLoadCsc, 'outgoingLoadCscs', []);
      outgoingLoadCscs.push(csc);
    })
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



