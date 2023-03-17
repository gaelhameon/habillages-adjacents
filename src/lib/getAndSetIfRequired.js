import * as _ from 'lodash'

/**
 * Gets the property value at path of object. If the resolved value is undefined the defaultValue is used
 * in its place and is set at path in object.
 *
 * @param object The object to query.
 * @param path The path of the property to get.
 * @param defaultValue The value returned if the resolved value is undefined.
 * @return {any} Returns the resolved value.
 */
export default function getAndSetIfRequired(object, path, defaultValue) {
  if (object instanceof Map) return getAndSetIfRequiredInMap(object, path, defaultValue);
  const value = _.get(object, path, defaultValue);
  if (!_.has(object, path)) {
    _.set(object, path, value);
  }
  return value;
}



/**
 * @typedef {Object} GetAndSetIfRequiredConfig
 * @property {string} param
 */

/**
 * Gets the value at key in map. If the value is undefined, the defaultValue is used
 * in its place and is set at key in the map.
 * @param {Map} map The map in which to get/set the value
 * @param {any} key The key of the value
 * @param {any} defaultValue The value returned if the resolved value is undefined.
 * @return {any} Returns the resolved value.
 */
function getAndSetIfRequiredInMap(map, key, defaultValue) {
  if (map.has(key)) return map.get(key);
  map.set(key, defaultValue);
  return defaultValue;
}
