import { getStupidLogger } from '../../getStupidLogger';

import { each } from 'lodash/each'

/**
 * Exports the data in oirStyleData into a csv file that will be compatible with the parsedControlFile.
 * Oir Style Data Example:
 * oirStyleData = {
 *    vehicle_schedule: [
 *        {
 *            vsc_name: "vsc1",
 *            vsc_scenario: "00",
 *            vsc_description: "Description du vsc 00",
 *            block: [
 *                {
 *                    blk_int_number: "1",
 *                    blk_vehicle_group: "Z50a",
 *                    block_activity: [...]
 *                },
 *                {},
 *                {}
 *            ],
 *            trip: [
 *                {
 *                    trp_int_number: "1",
 *                    trp_route: "D",
 *                    trip_point: [...]
 *                },
 *                {},
 *            ]
 *        }
 *    ]
 * }
 *
 * @param {Object} oirStyleData - Data in "oir style".
 * @param {Object} parsedControlFile - The parsed control file info.
 * @param {String} EOL - The character(s) to use at the end of each line.
 * @returns {string} - Csv string
 */
export default function exportDataAsCsv(oirStyleDataByKeyword, parsedControlFile, EOL = `\r\n`, logger = getStupidLogger(true)) {
  logger.trace(`got oirStyleDataByKeyword with keywords ${Object.keys(oirStyleDataByKeyword).join(', ')}`);
  let outputLines = parsedControlFile.headerRow ? [parsedControlFile.headerRow] : [];
  each(oirStyleDataByKeyword, (oirStyleData, keyword) => {
    logger.trace(`Handling ${keyword}`);
    const lineInfo = parsedControlFile.lineInfoByKeyword[keyword];
    oirStyleData.forEach((oirStyleObject) => {
      outputLines = createHastusStyleCsvForOneObject(oirStyleObject, outputLines, lineInfo, parsedControlFile.separator, logger);
    });
  });
  return outputLines.join(EOL);
};

const createHastusStyleCsvForOneObject = function (oirStyleData, ouputLines, lineInfo, separator = '|', logger) {
  const values = lineInfo.ignore ? [] : [lineInfo.keyword];
  lineInfo.items.forEach((item) => {
    logger.trace(`ajout de l'item ${item.name}`);
    let value = oirStyleData[item.name];
    if (value === undefined) value = oirStyleData._rawOigProps?.[item.name];
    // let value = `${item.name}=${oirStyleData[item.name]}`;
    if (!value || value === 'null') {
      value = '';
    }
    values.push(value);
  });
  logger.trace(`end of props: ${values}`);

  ouputLines.push(values.join(separator));

  if (lineInfo && lineInfo.lineInfoByKeyword) {
    each(lineInfo.lineInfoByKeyword, (lineInfo, keyword) => {
      logger.trace(keyword);
      const thisArray = oirStyleData[keyword];
      if (thisArray) {
        thisArray.forEach((object) => {
          ouputLines = createHastusStyleCsvForOneObject(object, ouputLines, lineInfo, separator, logger);
        });
      }
    });
  }
  return ouputLines;
};
