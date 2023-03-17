import { getStupidLogger } from '../../getStupidLogger';

import { each } from 'lodash'

const DEFAULT_SEPARATOR = ';';

let _convertItemNamesToCamel;
let logger = getStupidLogger(true);

export default function parseOir(oirAsString, convertItemNamesToCamel = false, specificLogger = undefined) {
  _convertItemNamesToCamel = convertItemNamesToCamel;
  logger = specificLogger ?? logger;

  const cleanOirAsString = removeCommentsAndDescAndConvertWeirdSpaces(oirAsString);
  const separator = getSeparator(cleanOirAsString) || DEFAULT_SEPARATOR;
  logger.debug(`Separator: ${separator}`);

  const headerRow = getHeaderRow(cleanOirAsString);
  logger.debug(`HeaderRow: ${headerRow}`);

  const { lineBlockAsStringByKeyword } = getLineBlockAsStringByKeywordAndNonLineBlocksString(cleanOirAsString);

  logger.trace(`== Finished Analyzing Root == \n Result:`);
  logger.trace(lineBlockAsStringByKeyword);

  const lineInfoByKeyword = {};
  each(lineBlockAsStringByKeyword, (rootLineBlockAsString, keyword) => {
    const firstLineBlockAsStringByKeywordAndNonLineBlocksString = getLineBlockAsStringByKeywordAndNonLineBlocksString(rootLineBlockAsString);
    const rootcleanedLineInfo = getcleanedLineInfo(firstLineBlockAsStringByKeywordAndNonLineBlocksString);
    lineInfoByKeyword[keyword] = rootcleanedLineInfo;
  });

  return { separator, headerRow, lineInfoByKeyword };
};

const CRLF = '\r\n';
const LF = '\n';
const crlfMatcher = new RegExp(CRLF, 'g');
const commentMatcher1 = /#.*\n/g;
const commentMatcher2 = /(\/\*(\s|\S)*?\*\/)/gm;
const weirdSpaceMatcher = / /g;
const descMatcher = /(desc\s+"(\s|\S)*?")|(desc\s+'(\s|\S)*?')/gm;
function removeCommentsAndDescAndConvertWeirdSpaces(rawOirAsString) {
  return rawOirAsString
    .replace(crlfMatcher, LF)
    .replace(weirdSpaceMatcher, ' ')
    .replace(commentMatcher1, '\n')
    .replace(commentMatcher2, '')
    .replace(descMatcher, '');
}

function getSeparator(cleanOirAsString) {
  const separatorMatcher = /(?:separator +"(.)")|(?:separator +'(.)')/;
  const matches = separatorMatcher.exec(cleanOirAsString);
  if (matches) {
    if (matches[1]) {
      return matches[1];
    }
    if (matches[2]) {
      return matches[2];
    }

    throw new Error(`Separator is specified but is not recognized. Check OIR control file syntax.`);
  }
  return null;
}

function getHeaderRow(cleanOirAsString) {
  const headerRowMatcher = /(?:headerRow +"([^"]*)")|(?:headerRow +'([^']*)')/;
  const matches = headerRowMatcher.exec(cleanOirAsString);
  if (matches) {
    if (matches[1]) {
      return matches[1];
    }
    if (matches[2]) {
      return matches[2];
    }

    throw new Error(`headerRow is specified but is not recognized. Check control file syntax.`);
  }
  return null;
}

function getLineBlockAsStringByKeywordAndNonLineBlocksString(mixedString) {
  logger.trace(`Will extract rootLineBlocks from following string:\n${mixedString}`);

  const lineMatcher = /line +\w+\s+{\s+keyword +(\w+)/;

  const lineBlockAsStringByKeyword = {};

  let remainingString = mixedString;
  let nonLineBlocksString = '';

  let result;

  do {
    logger.trace(`Looking for first line block in remaining string:\n${remainingString}`);
    result = lineMatcher.exec(remainingString);
    if (!result) {
      logger.trace(`No line blocks found. Will add remaining string to nonLineBlocksString and quit.`);
      nonLineBlocksString = `${nonLineBlocksString}\n${remainingString}`;
    }
    else {
      const startOfLineBlock = result.index;
      const keyword = result[1];

      logger.trace(`Found line block starting at ${startOfLineBlock} with keyword ${keyword}`);

      const portionToAddToNonLineBlocksString = remainingString.slice(0, startOfLineBlock);
      logger.trace(`Will add following string to nonLineBlocksString:\n${portionToAddToNonLineBlocksString}`);
      nonLineBlocksString = `${nonLineBlocksString}\n${portionToAddToNonLineBlocksString}`;

      const indexOfFirstOpenBracket = remainingString.indexOf('{', startOfLineBlock);
      let currentIndex = indexOfFirstOpenBracket + 1;

      let countOfOpenBrackets = 1;
      logger.trace(`Will count brackets until back to zero, starting at ${currentIndex}`);
      while ((countOfOpenBrackets > 0) && (currentIndex < remainingString.length)) {
        if (remainingString[currentIndex] === '{') {
          countOfOpenBrackets += 1;
          logger.trace(`Found { at ${currentIndex}. CountOfOpenBrackets = ${countOfOpenBrackets}`);
        }
        else if (remainingString[currentIndex] === '}') {
          countOfOpenBrackets -= 1;
          logger.trace(`Found } at ${currentIndex}. CountOfOpenBrackets = ${countOfOpenBrackets}`);
        }
        currentIndex += 1;
      }
      if (currentIndex >= remainingString.length) {
        throw new Error(`Unmatched open bracket. Check control file syntax.`);
      }
      else {
        logger.trace(`Reached 0 open brackets at index ${currentIndex}. Closing line block here`);
        const endOfLineBlock = currentIndex;
        if (lineBlockAsStringByKeyword[keyword]) {
          throw new Error(`Duplicate keyword ${keyword}`);
        }
        lineBlockAsStringByKeyword[keyword] = remainingString.slice(indexOfFirstOpenBracket + 1, endOfLineBlock - 1);
        remainingString = remainingString.slice(endOfLineBlock + 1);
      }
    }
  } while (result);

  // _logger.trace(`Returning with: nonLineBlocksString:\n${nonLineBlocksString}`);
  // _logger.trace(`Returning with: lineBlockAsStringByKeyword:`);
  // _logger.trace(lineBlockAsStringByKeyword);
  return { nonLineBlocksString, lineBlockAsStringByKeyword };
}

function getcleanedLineInfo({ nonLineBlocksString, lineBlockAsStringByKeyword }) {
  logger.trace(`Starting getcleanedLineInfo with (nonLineBlocksString, lineBlockAsStringByKeyword)`);
  logger.trace(nonLineBlocksString);
  logger.trace(lineBlockAsStringByKeyword);

  const cleanedLineInfo = parseNonLineBlocksString(nonLineBlocksString);

  logger.trace(`Current cleanedLineInfo:\n${JSON.stringify(cleanedLineInfo)}`);

  if (Object.keys(lineBlockAsStringByKeyword).length > 0) {
    logger.trace(`Will clean subLines`);
    cleanedLineInfo.lineInfoByKeyword = {};
    each(lineBlockAsStringByKeyword, (lineBlockAsString, keyword) => {
      logger.trace(`Cleaning subLine with keyword ${keyword}`);

      cleanedLineInfo.lineInfoByKeyword[keyword] = getcleanedLineInfo(getLineBlockAsStringByKeywordAndNonLineBlocksString(lineBlockAsString));
    });
  }
  return cleanedLineInfo;
}

function parseNonLineBlocksString(nonLineBlocksString) {
  logger.trace(`Starting parsing of a nonLineBlocksString`);
  const keywordAndIgnoreMatcher = /^\s*keyword +(\w+)( ignore)? *$/gm;
  const objectTypeMatcher = /^\s*object +(\w+) *$/gm;
  const itemMatcher = /^.*item +(\w+) *({.*})? *$/gm;

  const keywordResult = keywordAndIgnoreMatcher.exec(nonLineBlocksString);
  if (!keywordResult) {
    throw new Error(`Could not match a keyword in the following string. Check OIR syntax.\n${nonLineBlocksString}`);
  }
  const keyword = keywordResult[1];
  const ignore = !!keywordResult[2];
  logger.trace(`Found keyword: ${keyword} with ignore flag: ${ignore}`);

  const objectTypeResult = objectTypeMatcher.exec(nonLineBlocksString);
  if (!objectTypeResult) {
    throw new Error(`Could not match an object in the following string. Check OIR syntax.\n${nonLineBlocksString}`);
  }
  const objectType = objectTypeResult[1];
  logger.trace(`Found object: ${objectType}`);

  let itemResult;
  const items = [];

  while ((itemResult = itemMatcher.exec(nonLineBlocksString)) !== null) {
    items.push({
      name: _convertItemNamesToCamel ? snakeToCamel(itemResult[1]) : itemResult[1],
      special: itemResult[2],
    });
    logger.trace(`Found item: ${itemResult[1]}`);
  }

  if (items.length === 0) {
    throw new Error(`Could not match an item in the following string. Check OIR syntax.\n${nonLineBlocksString}`);
  }
  return { keyword, ignore, objectType, items };
}

function snakeToCamel(snakeString) {
  return snakeString.replace(/([_][a-z])/ig, (lodashAndLetter) => lodashAndLetter.toUpperCase().replace('_', ''));
}
