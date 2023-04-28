
import { createLinksAndComputeStatsForOneCsc } from "./createLinksAndComputeStats";

export default function getMermaidStringForCsc(csc) {
  if (!csc.linkByLinkKey) {
    createLinksAndComputeStatsForOneCsc(csc);
  }
  return getMermaidString(csc.linkByLinkKey, Array.from(csc.allIncomingLoadCscs), csc.depthByIncomingLoadCsc);
}








/**
 * 
 * @param {Map} linkByLinkKey 
 */
function getMermaidString(linkByLinkKey, cscs, depthByIncomingLoadCsc) {
  const links = Array.from(linkByLinkKey.values());

  return `graph TD
${classesDefString}
${getNodesString(cscs, depthByIncomingLoadCsc)}
${getLinksString(links)}
${legendString}
${getLinkStyleString(links)}
`
}

function getNodesString(cscs, depthByIncomingLoadCsc) {
  return cscs.map((csc) => {
    const depth = depthByIncomingLoadCsc.get(csc) ?? 0;
    return `${csc.shortKey}[${csc.cscKey}<br>`
      + `${csc.cscSchedUnit} ${csc.cscServiceCtxId ? ` _________ ${csc.cscServiceCtxId}` : ''}<br>`
      + `${csc.dateAsDate.toLocaleDateString()} ${csc.dateAsDate.toLocaleTimeString()} ${csc.cscUserStamp}<br>`
      + `Profondeur ${depth}`
      + `]:::${getClassNameOfCsc(csc, depth === 0)}`
  }).join('\n')
}

function getLinksString(links) {
  return links.map(({ from, to, isBidirectional }) => {
    const arrowString = isBidirectional ? '---' : '-->';
    return `${from.shortKey} ${arrowString} ${to.shortKey}`
  }).join('\n');
}

function getClassNameOfCsc(csc, isMain) {
  const letter = csc.cscBooking.slice(0, 1);
  const adjustedLetter = classStyleByClassName[letter] ? letter : 'Z';
  if (isMain) return adjustedLetter + '_main';
  if (csc.isOld) return adjustedLetter + '_old';
  return adjustedLetter;
}

function getLinkStyleString(links) {
  if (links.length === 0) return '';
  const singleLinkIndexes = [];
  const biDirLinkIndexes = [];
  links.forEach((link, index) => {
    if (link.isBidirectional) {
      biDirLinkIndexes.push(index);
    }
    else {
      singleLinkIndexes.push(index);
    }
  });
  const linkStyleLines = [
    (singleLinkIndexes.length === 0 ? false : `linkStyle ${singleLinkIndexes} stroke-width:3px,stroke:#000000,color:black;`),
    (biDirLinkIndexes.length === 0 ? false : `linkStyle ${biDirLinkIndexes} stroke-width:6px,stroke:#022992,color:black;`),
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
  B_old: `fill:#e6194B,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  C_old: `fill:#3cb44b,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  D_old: `fill:#ffe119,color:#000000,stroke:#FF0000,stroke-width:4px;`,
  F_old: `fill:#4363d8,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  G_old: `fill:#f58231,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  J_old: `fill:#911eb4,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  K_old: `fill:#42d4f4,color:#000000,stroke:#FF0000,stroke-width:4px;`,
  L_old: `fill:#f032e6,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  M_old: `fill:#bfef45,color:#000000,stroke:#FF0000,stroke-width:4px;`,
  R_old: `fill:#fabed4,color:#000000,stroke:#FF0000,stroke-width:4px;`,
  S_old: `fill:#469990,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  T_old: `fill:#dcbeff,color:#000000,stroke:#FF0000,stroke-width:4px;`,
  U_old: `fill:#9A6324,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  Z_old: `fill:#000000,color:#FFFFFF,stroke:#FF0000,stroke-width:4px;`,
  B_main: `fill:#e6194B,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  C_main: `fill:#3cb44b,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  D_main: `fill:#ffe119,color:#000000,stroke:#000000,stroke-width:9px;`,
  F_main: `fill:#4363d8,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  G_main: `fill:#f58231,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  J_main: `fill:#911eb4,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  K_main: `fill:#42d4f4,color:#000000,stroke:#000000,stroke-width:9px;`,
  L_main: `fill:#f032e6,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  M_main: `fill:#bfef45,color:#000000,stroke:#000000,stroke-width:9px;`,
  R_main: `fill:#fabed4,color:#000000,stroke:#000000,stroke-width:9px;`,
  S_main: `fill:#469990,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  T_main: `fill:#dcbeff,color:#000000,stroke:#000000,stroke-width:9px;`,
  U_main: `fill:#9A6324,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
  Z_main: `fill:#000000,color:#FFFFFF,stroke:#000000,stroke-width:9px;`,
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