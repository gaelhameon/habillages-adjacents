
export default function createLinksAndComputeStats(cscs) {
  cscs.forEach(createLinksAndComputeStatsForOneCsc);
}

export function createLinksAndComputeStatsForOneCsc(csc) {
  csc.allAdjacentCscs = new Set();
  csc.linkByLinkKey = new Map();
  recursivelyVisitCscAndCreateLinks(csc, csc.allAdjacentCscs, csc.linkByLinkKey);
  simplifyBidirectionalLinks(csc.linkByLinkKey);
  csc.totalNumberOfAdjacents = csc.allAdjacentCscs.size - 1;
  csc.firstDegreeAdjacents = csc.uniqueAdjacents.length;
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