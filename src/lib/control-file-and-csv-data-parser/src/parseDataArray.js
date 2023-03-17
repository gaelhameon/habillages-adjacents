import { getStupidLogger } from '../../getStupidLogger';

let logger = getStupidLogger(true);

import { each } from 'lodash'

/**
 * Parses the data in splitLines, using the parsed control file info in rootLineInfoByKeyword.
 * @param {string[][]} splitLines - The array of arrays that each represent a line of the data file.
 * @param {Object} parsedControlFile - The parsed control file.
 * @returns {Object} - Javascript Object that contains the data structured according to the control file and lots of metadata.
 */
export default function parseDataArray(splitLines, parsedControlFile, specificLogger = undefined) {
  logger = specificLogger ?? logger;
  const { separator, lineInfoByKeyword: rootLineInfoByKeyword } = parsedControlFile;
  const rootObject = {
    type: 'root',
    lineInfoByKeyword: rootLineInfoByKeyword,
  };

  const lastObjectByObjectType = { root: rootObject };
  const { parentObjectTypeByObjectType, keywordByObjectType, objectTypeByKeyword } = createMetaObjects(rootObject);

  prepareChildObjectsByChildObjectType(rootObject, rootLineInfoByKeyword);

  splitLines.forEach((splitLine, index) => {
    const keyword = splitLine[0];
    logger.debug(`Parsing line ${index}. Keyword: ${keyword}.`);
    if (!keyword) {
      logger.warn(`Line ${index} seems empty and will be skipped.`);
      return;
    }

    const objectType = objectTypeByKeyword[keyword];
    if (!objectType) {
      throw new Error(`Could not find a suitable objectType for this keyword: ${keyword}`);
    }

    const parentObjectType = parentObjectTypeByObjectType[objectType];
    if (!parentObjectType) {
      throw new Error(`Could not find a parent object type for this object type: ${objectType}`);
    }

    const parentObject = lastObjectByObjectType[parentObjectType];
    if (!parentObject) {
      throw new Error(`Could not find a parent object (of type ${parentObjectType}) for this object type: ${objectType}`);
    }

    const lineInfoForThisKeyword = parentObject.lineInfoByKeyword && parentObject.lineInfoByKeyword[keyword];
    if (lineInfoForThisKeyword) {
      const newObject = createObject(splitLine, lineInfoForThisKeyword, separator);
      addObjectToParent(newObject, parentObject, lineInfoForThisKeyword);
      lastObjectByObjectType[newObject.type] = newObject;
    }
  });
  return rootObject;
};

/**
 * Creates a javascript object from the data in splitLine, structured according to lineInfo.
 * @param {string[]} splitLine  - The array of strings created from a line of the data file.
 * @param {Object} lineInfo - The info on how to structure this line, parsed from the control file.
 * @param {string} separator - The separator
 * @returns {Object} The javascript object.
 */
function createObject(splitLine, lineInfo, separator) {
  const newObject = {};
  newObject.type = lineInfo.objectType;
  newObject.valueByItemName = {};
  for (let i = 1; i < splitLine.length; i++) {
    const item = lineInfo.items[i - 1];
    if (!item) {
      const newError = new Error(`Problème avec cette ligne du fichier de données:\n${splitLine.join(separator)}`
        + `\nIl y a plus de valeurs dans le fichier de données que ce qui est prévu par le fichier de contrôle:`
        + `\n${lineInfo.items.map((it) => it.name).join(separator)}`
        + `\nCeci est généralement du à l'une des causes suivantes:`
        + `\n  - Incohérence entre le fichier OIG utilisé pour extraire les données d'Hastus et `
        + ` le fichier OIR utilisé pour les importer dans Apollo`
        + `\n  - Présence du caractère séparateur (${separator}) dans une des valeurs du fichier de données`);
      newError.lineInfo = lineInfo;
      newError.lineInfoItems = JSON.stringify(lineInfo.items);
      newError.splitLine = splitLine;
      throw newError;
    }
    newObject.valueByItemName[item.name] = (splitLine[i].trim());
  }
  if (lineInfo.lineInfoByKeyword) {
    prepareChildObjectsByChildObjectType(newObject, lineInfo.lineInfoByKeyword);
  }
  return newObject;
}

/**
 * Adds an empty array for each child object type that can be added to the parent object.
 * @param {Object} parentObject - The parent object on which child objects will be added.
 * @param {Object} childLineInfoByKeyword - Info on each child objects, by keyword associated with these child objects.
 */
function prepareChildObjectsByChildObjectType(parentObject, childLineInfoByKeyword) {
  parentObject.childObjectsByChildObjectType = {};
  each(childLineInfoByKeyword, (childLineInfo, keyword) => {
    parentObject.childObjectsByChildObjectType[childLineInfo.objectType] = [];
  });
}

/**
 * Assigns the parent to the object, adds lineInfo on the object and adds the object on its parent.
 * @param {Object} newObject - The new object to be added to the parent.
 * @param {Object} parent - The parent object on which the new object should be added.
 * @param {Object} lineInfoForThisKeyword - The line info associated with the parent object.
 */
function addObjectToParent(newObject, parent, lineInfoForThisKeyword) {
  newObject.parent = parent;
  newObject.lineInfoByKeyword = lineInfoForThisKeyword.lineInfoByKeyword;
  logger.trace(newObject);
  newObject.parent.childObjectsByChildObjectType[newObject.type].push(newObject);
}

function createMetaObjects(rootObject) {
  logger.debug(`Will create meta-objects`);
  const parentObjectTypeByObjectType = {};
  const keywordByObjectType = {};
  const objectTypeByKeyword = {};

  each(rootObject.lineInfoByKeyword, (lineInfo, keyword) => {
    addInfoToMetaObjectsForThisLineInfo(lineInfo, keyword, rootObject.type);
  });

  function addInfoToMetaObjectsForThisLineInfo(lineInfo, keyword, parentObjectType) {
    parentObjectTypeByObjectType[lineInfo.objectType] = parentObjectType;
    keywordByObjectType[lineInfo.objectType] = keyword;
    objectTypeByKeyword[keyword] = lineInfo.objectType;
    if (lineInfo.lineInfoByKeyword) {
      each(lineInfo.lineInfoByKeyword, (childLineInfo, childKeyword) => {
        addInfoToMetaObjectsForThisLineInfo(childLineInfo, childKeyword, lineInfo.objectType);
      });
    }
  }
  logger.debug(`Finished creating meta-objects`);
  logger.trace(parentObjectTypeByObjectType);
  logger.trace(keywordByObjectType);
  logger.trace(objectTypeByKeyword);

  return { parentObjectTypeByObjectType, keywordByObjectType, objectTypeByKeyword };
}
