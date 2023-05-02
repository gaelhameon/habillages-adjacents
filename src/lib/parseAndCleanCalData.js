import Parser from "./control-file-and-csv-data-parser";
import getAndSetIfRequired from "./getAndSetIfRequired";


export async function parseAndCleanCalData(data) {
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

  const { scheduling_unit_date } = oirStyleData;

  const schedulingUnitDatesByCscKey = {};
  const dateMatcher = /^(\d\d)\/(\d\d)\/(\d{4})$/
  scheduling_unit_date.forEach((schedUnitDate) => {
    const cscKey = getKeyFromRawSchedUnitDate(schedUnitDate);
    schedUnitDate.cscKey = cscKey;

    const match = dateMatcher.exec(schedUnitDate.scudDate);
    if (!match) throw new Error(`Mauvais format de date: ${schedUnitDate.scudDate}`);
    const [_, day, month, year] = match;
    schedUnitDate.dateAsDate = new Date(`${year}-${month}-${day}`);
    schedUnitDate.dateAsIsoString = schedUnitDate.dateAsDate.toISOString();
    const schedulingUnitDates = getAndSetIfRequired(schedulingUnitDatesByCscKey, cscKey, []);
    schedulingUnitDates.push(schedUnitDate);
  });

  console.log(schedulingUnitDatesByCscKey)

  return {
    schedulingUnitDatesByCscKey,
  };
}


function getKeyFromRawSchedUnitDate(rawSchedUnitDate) {
  const { scudScheduleName, scudScheduleType, scudSchedScenario, scudScheduleBooking } = rawSchedUnitDate;
  const cscKey = [
    scudScheduleBooking,
    scudScheduleName,
    scudScheduleType,
    scudSchedScenario,
  ].join('-');
  return cscKey;
}



