
import parseOir from './src/parseOir';
import parseDataArray from './src/parseDataArray';
import exportDataAsCsv from './src/exportDataAsCsv';
import getCleanObjectFromParsedDataArray from './src/getCleanObjectFromParsedDataArray';


class Parser {
  /**
     *
     * @param {String} dataFile - data file as string
     * @param {String} controlFile - control file as string
     * @param {Object} options - options
     * @param {Boolean} options.convertKeysToCamel - true to convert keys from snake_case to camelCase
     * @param {Boolean} options.convertItemNamesToCamel - true to convert keys from snake_case to camelCase
     */
  constructor(dataFile, controlFile, options = { convertKeysToCamel: false, convertItemNamesToCamel: false }, logger) {
    this.dataFile = dataFile;
    this.controlFile = controlFile;
    this.parsedControlFile = {};
    this.initialised = false;
    this.parsedDataFile = {};
    this.dataAsCsv = '';
    this.options = options;
    this.logger = logger;
  }

  async init() {
    // vestige de l'époque on on lisait les fichiers sur disque. on garde pour le moment ...
    this.parsedControlFile = parseOir(this.controlFile, this.options.convertItemNamesToCamel, this.logger);
    this.initialised = true;
  }

  /**
     * Parses the data file using the control file that were used to initialize the parser and stores it in this.result.
     * @async
     * @returns {Promise<Object>} A javascript object that contains the data of the data file structured according to the control file.
     */
  async parseDataFile(options) {
    if (!this.initialised) {
      await this.init();
    }

    const splitLines = getSplitLinesFromRawDataFile(this.dataFile, this.parsedControlFile.separator);
    const fullParsedDataArray = parseDataArray(splitLines, this.parsedControlFile);

    const result = getCleanObjectFromParsedDataArray(fullParsedDataArray, this.options);

    this.parsedDataFile = result;
    return this.parsedDataFile;
  }

  outputDataAsCsv() {
    this.dataAsCsv = exportDataAsCsv(this.parsedDataFile, this.parsedControlFile, undefined, this.logger);
    return this.dataAsCsv;
  }
}

/**
 * Converts the csv data file into an array of arrays.
 * @param {string} rawDataFile - Multiline string that contains data, each value on a line is separated by separator.
 * @param {string} separator - The separator that separates values on a line.
 * @returns {string[][]} - Array of string arrays. One element per value in the inner array, one element per line in the outer array.
 */
function getSplitLinesFromRawDataFile(rawDataFile, separator) {
  const rawLines = rawDataFile.split(/\r?\n\r?/);
  return rawLines.map((rawLine) => rawLine.split(separator));
}

export default Parser
