
export function getMermaidString(numberOfDatesBySchedUnitsKey, {
  lettersOfRegionsToInclude = ['L', 'R'],
  includeInternalLinks = false,
  minimumNumberOfDatesToKeepLink = 0,
} = {}) {
  const filteredNumberOfDatesBySchedUnitsKey = Object.fromEntries(
    Object.entries(numberOfDatesBySchedUnitsKey).filter(([key, number]) => {
      const regionLetters = key.split('|').map((schedUnitName) => schedUnitName.slice(0, 1));
      return (includeInternalLinks || regionLetters[0] !== regionLetters[1]) &&
        number >= minimumNumberOfDatesToKeepLink &&
        lettersOfRegionsToInclude.some((letter) => regionLetters.includes(letter));
    })
  );

  return `graph TD
${classesDefString}
${getNodesString(filteredNumberOfDatesBySchedUnitsKey)}
${getLinksString(filteredNumberOfDatesBySchedUnitsKey)}
${legendString}
${getLinkStyleString(filteredNumberOfDatesBySchedUnitsKey)}
`
}

function getAllSchedUnitNames(numberOfDatesBySchedUnitsKey) {
  const allKeys = Object.keys(numberOfDatesBySchedUnitsKey);
  const allNames = new Set();
  allKeys.forEach((key) => {
    const [name1, name2] = key.split('|');
    allNames.add(name1);
    allNames.add(name2);
  });
  return Array.from(allNames);
}

function getNodesString(numberOfDatesBySchedUnitsKey) {
  const allNames = getAllSchedUnitNames(numberOfDatesBySchedUnitsKey);
  return allNames.map((schedUnitName) => {
    return `${schedUnitName}[${schedUnitName}]:::${getClassNameOfSchedUnit(schedUnitName)}`
  }).join('\n')
}

function getLinksString(numberOfDatesBySchedUnitsKey) {
  return Object.entries(numberOfDatesBySchedUnitsKey).map(([key, number]) => {
    const [name1, name2] = key.split('|');
    const arrowString = `-- ${number} -->`;
    return `${name1} ${arrowString} ${name2}`
  }).join('\n');
}

function getClassNameOfSchedUnit(schedUnitName) {
  const letter = schedUnitName.slice(0, 1);
  const adjustedLetter = classStyleByClassName[letter] ? letter : 'Z';
  return adjustedLetter;
}

function getLinkStyleString(numberOfDatesBySchedUnitsKey) {
  const links = Object.keys(numberOfDatesBySchedUnitsKey);
  if (links.length === 0) return '';
  const allLinkIndexes = [];
  links.forEach((link, index) => {
    allLinkIndexes.push(index);
  });
  const linkStyleLines = [
    `linkStyle ${allLinkIndexes} stroke-width:3px,stroke:#000000,color:black;`,
    `linkStyle default stroke-width:0px`
  ]
  return linkStyleLines.filter(Boolean).join('\n');
}

const classStyleByClassName = {
  B: `fill:#e6194B,color:#FFFFFF,stroke:none;`,
  C: `fill:#3cb44b,color:#FFFFFF,stroke:none;`,
  D: `fill:#ffe119,color:#000000,stroke:none;`,
  F: `fill:#4363d8,color:#FFFFFF,stroke:none;`,
  G: `fill:#f58231,color:#FFFFFF,stroke:none;`,
  J: `fill:#911eb4,color:#FFFFFF,stroke:none;`,
  K: `fill:#42d4f4,color:#000000,stroke:none;`,
  L: `fill:#f032e6,color:#FFFFFF,stroke:none;`,
  M: `fill:#bfef45,color:#000000,stroke:none;`,
  R: `fill:#fabed4,color:#000000,stroke:none;`,
  S: `fill:#469990,color:#FFFFFF,stroke:none;`,
  T: `fill:#dcbeff,color:#000000,stroke:none;`,
  U: `fill:#9A6324,color:#FFFFFF,stroke:none;`,
  Z: `fill:#000000,color:#FFFFFF,stroke:none;`,
};

const legendTextByClassName = {
  B: `NAQ`,
  C: `IC`,
  D: `BFC`,
  F: `LEX`,
  G: `PDL`,
  J: `BZH`,
  K: `AURA`,
  L: `HDF`,
  M: `SUD`,
  R: `NMD`,
  S: `GE`,
  T: `OCC`,
  U: `CVDL`,
  Z: `Autre`
}

function getClassesDefString() {
  return Object.entries(classStyleByClassName).map(([className, classStyle,]) => `classDef ${className} ${classStyle}`).join('\n');
}

const classesDefString = getClassesDefString();

function getLegendString() {
  return Object.entries(legendTextByClassName).map(([className, legendText]) => `${legendText}[${legendText}]:::${className}`).join('\n') +
    `
subgraph Légende
direction TB
NAQ---IC---BFC---LEX---GE---OCC---CVDL
PDL---BZH---AURA---HDF---SUD---NMD---Autre
end`
}
const legendString = getLegendString();