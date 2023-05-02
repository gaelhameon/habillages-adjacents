import Parser from "./control-file-and-csv-data-parser";
import getAndSetIfRequired from "./getAndSetIfRequired";

export async function computeDependencyData(cscByCscKey, schedulingUnitDatesByCscKey) {

  const dependencyDataBySchedulingUnit = {};

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
        })
      })

      // const incomingSchedUnitsForThisSchedUnit = getAndSetIfRequired(incomingData, csc.cscSchedUnit, new Set());
      // incomingSchedUnitsForThisSchedUnit.add(incomingLoadCsc.cscSchedUnit);
    });
  });

  console.log({ dependencyDataBySchedulingUnit });

  return dependencyDataBySchedulingUnit
}



