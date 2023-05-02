import Parser from "./control-file-and-csv-data-parser";
import getAndSetIfRequired from "./getAndSetIfRequired";
import { get } from "lodash";

export async function computeDependencyData(cscByCscKey, schedulingUnitDatesByCscKey) {

  const dependencyDataBySchedulingUnit = {};
  const allDates = [];
  Object.values(cscByCscKey).forEach((csc) => {
    (csc.outgoingLoadCscs ?? []).forEach((outgoingLoadCsc) => {

      const dataForThisOutgoingSchedUnit = getAndSetIfRequired(dependencyDataBySchedulingUnit,
        [csc.cscSchedUnit, 'charge_exportée_vers', outgoingLoadCsc.cscSchedUnit],
        {});
      const schedulingUnitDatesOfCsc = schedulingUnitDatesByCscKey[outgoingLoadCsc.cscKey] ?? [];

      const dates = getAndSetIfRequired(dataForThisOutgoingSchedUnit, 'dates', []);
      schedulingUnitDatesOfCsc.forEach((schedUnitDate) => {
        dates.push({
          date: schedUnitDate.scudDate,
          de: csc,
          vers: outgoingLoadCsc,
          // scudDate: schedUnitDate
        })
      })
    });


    csc.incomingLoadCscs.forEach((incomingLoadCsc) => {
      const dataForThisIncomingSchedUnit = getAndSetIfRequired(dependencyDataBySchedulingUnit,
        [csc.cscSchedUnit, 'charge_importée_de', incomingLoadCsc.cscSchedUnit],
        {}
      );
      const schedulingUnitDatesOfCsc = schedulingUnitDatesByCscKey[csc.cscKey] ?? [];

      const dates = getAndSetIfRequired(dataForThisIncomingSchedUnit, 'dates', []);
      schedulingUnitDatesOfCsc.forEach((schedUnitDate) => {
        dates.push({
          date: schedUnitDate.scudDate,
          de: incomingLoadCsc,
          vers: csc,
          // scudDate: schedUnitDate
        });

        allDates.push({
          from: incomingLoadCsc,
          to: csc,
          scudDate: schedUnitDate
        })
      })

      // const incomingSchedUnitsForThisSchedUnit = getAndSetIfRequired(incomingData, csc.cscSchedUnit, new Set());
      // incomingSchedUnitsForThisSchedUnit.add(incomingLoadCsc.cscSchedUnit);
    });
  });

  console.log({ dependencyDataBySchedulingUnit });

  return { dependencyDataBySchedulingUnit, allDates }
}



const headers = [
  'date',
  'de région',
  'vers région',
  'de UH',
  'vers UH',
  'de habillage',
  'vers habillage',
];
const paths = [
  'scudDate.dateAsIsoString',
  'from.regionLetter',
  'to.regionLetter',
  'from.cscSchedUnit',
  'to.cscSchedUnit',
  'from.cscKey',
  'to.cscKey',
];
export function getDependencyDataAsCsv({ allDates }) {
  const headersLine = `"${headers.join('";"')}"`;
  const dateLines = allDates.map((dateData) => {
    return `"${paths.map((path) => get(dateData, path)).join('";"')}"`;
  })
  return [headersLine, ...dateLines].join('\n')
}


