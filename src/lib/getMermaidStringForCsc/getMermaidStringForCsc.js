export default function getMermaidStringForCsc(csc) {
  const visitedCscs = new Set();
  const linkByLinkKey = new Map();
  recursivelyVisitCscAndCreateLinks(csc, visitedCscs, linkByLinkKey);
  simplifyBidirectionalLinks(linkByLinkKey);
  return getMermaidString(linkByLinkKey);
}






function recursivelyVisitCscAndCreateLinks(cscToVisit, visitedCscs, linkByLinkKey) {
  visitedCscs.add(cscToVisit);
  cscToVisit.uniqueAdjacents.forEach((adjCsc) => {
    const link = { from: cscToVisit, to: adjCsc, isBidirectional: false, key: `${cscToVisit.shortKey}|${adjCsc.shortKey}` };
    linkByLinkKey.set(link.key, link);
    if (!visitedCscs.has(adjCsc)) {
      recursivelyVisitCscAndCreateLinks(adjCsc, visitedCscs, linkByLinkKey);
    }
  });
}

/**
 * 
 * @param {Map} linkByLinkKey 
 */
function simplifyBidirectionalLinks(linkByLinkKey) {
  const linksToDelete = new Set();
  linkByLinkKey.forEach((link) => {
    if (linksToDelete.has(link)) return;
    const oppositeKey = `${link.to.shortKey}|${link.from.shortKey}`;
    const oppositeLink = linkByLinkKey.get(oppositeKey);
    if (oppositeLink) {
      linksToDelete.add(oppositeLink);
      link.isBidirectional = true;
    }
  });

  linksToDelete.forEach((linkToDelete) => {
    linkByLinkKey.delete(linkToDelete.key);
  });
}

/**
 * 
 * @param {Map} linkByLinkKey 
 */
function getMermaidString(linkByLinkKey) {
  const links = Array.from(linkByLinkKey.values());

  return `graph TD\n${links.map(({ from, to, isBidirectional }) => {
    const arrowString = isBidirectional ? '===' : '-->';
    return `${from.shortKey}[${from.cscKey}] ${arrowString} ${to.shortKey}[${to.cscKey}]`
  }).join('\n')}\n${getLinkStyleString(links)}`
}

function getLinkStyleString(links) {
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
  return `linkStyle ${singleLinkIndexes} stroke-width:3px,stroke:#000000,color:black;;\n` +
    `linkStyle ${biDirLinkIndexes} stroke-width:4px,stroke:#022992,color:black;`
}