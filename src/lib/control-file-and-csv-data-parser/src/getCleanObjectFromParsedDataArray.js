import { each } from 'lodash'

/**
 * Cleans the ....
 * @param {Object} rootObject - The root object with all its metadata.
 * @returns {Object} - Cleaned Javascript Object that contains the data structured according to the control file, but no metadata.
 */
export default function getCleanObjectFromParsedDataArray(rootObject, options) {
  return getCleanObjectFromComplexObject(rootObject, options);
};

/**
 * Recursively cleans a complex object by removing its metadata.
 * @param {Object} complexObject - The object to clean, with all its metadata.
 * @returns {Object} - The cleaned object, with clean child objects.
 */
function getCleanObjectFromComplexObject(complexObject, options) {
  // logDebugVerbose(complexObject);
  const cleanObject = {};
  if (complexObject.valueByItemName) {
    Object.keys(complexObject.valueByItemName).forEach((itemName) => {
      const value = complexObject.valueByItemName[itemName];
      const cleanName = options.convertKeysToCamel ? snakeToCamel(itemName) : itemName;
      cleanObject[cleanName] = value;
    });
  }

  if (complexObject.childObjectsByChildObjectType) {
    each(complexObject.childObjectsByChildObjectType, (childObjects, objectType) => {
      const cleanChildObjects = [];
      childObjects.forEach((childObject) => {
        const cleanChildObject = getCleanObjectFromComplexObject(childObject, options);
        cleanChildObjects.push(cleanChildObject);
      });
      cleanObject[objectType] = cleanChildObjects;
    });
  }
  return cleanObject;
}

function snakeToCamel(snakeString) {
  return snakeString.replace(/([_][a-z])/ig, (lodashAndLetter) => lodashAndLetter.toUpperCase().replace('_', ''));
}

function camelToPascal(camelString) {
  return camelString.replace(/^[a-z]/, (firstChar) => firstChar.toUpperCase());
}

function snakeToPascal(snakeString) {
  return camelToPascal(snakeToCamel(snakeString));
}
