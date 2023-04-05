
export default function createLinksAndComputeStats(cscs, schedulingUnitDatesByCscKey, params) {
  cscs.forEach((csc) => createLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, params));
}


export function createLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, {
  calendarThresholdDate,
  thresholdDepth
} = {}) {
  csc.allAdjacentCscs = new Set();
  csc.linkByLinkKey = new Map();
  csc.depthByAdjacentCsc = new Map();
  recursivelyVisitCscAndCreateLinks(csc, csc.allAdjacentCscs, csc.linkByLinkKey, csc, 0);
  simplifyBidirectionalLinks(csc.linkByLinkKey);
  csc.totalNumberOfAdjacents = csc.allAdjacentCscs.size - 1;
  csc.firstDegreeAdjacents = csc.uniqueAdjacents.length;

  const schedulingUnitDatesOfCsc = schedulingUnitDatesByCscKey[csc.cscKey] ?? [];
  const schedulingUnitDatesOfCscAfterThresholdDate = schedulingUnitDatesOfCsc.filter((schedUnitDate) => schedUnitDate.dateAsDate >= calendarThresholdDate)
  csc.numberOfDatesInCalAfterThresholdDate = schedulingUnitDatesOfCscAfterThresholdDate.length;

  const adjacentCscAndDepthInfos = Array.from(csc.depthByAdjacentCsc.entries()).map(([adjacentCsc, depth]) => ({ adjacentCsc, depth }));
  const lowDepthAdjacents = adjacentCscAndDepthInfos.filter(({ depth }) => {
    return depth <= thresholdDepth;
  });
  const oldSaveDateCscAndDepthInfos = adjacentCscAndDepthInfos.filter(({ adjacentCsc }) => {
    return adjacentCsc.isOld;
  });
  const oldSaveDateAndDepthLessThanTwoCscAndDepthInfos = oldSaveDateCscAndDepthInfos.filter(({ depth }) => depth <= thresholdDepth);
  csc.numberOfOldSaveDateAdjacents = oldSaveDateCscAndDepthInfos.length;
  csc.numberOfOldSaveDateAndLowDepthAdjacents = oldSaveDateAndDepthLessThanTwoCscAndDepthInfos.length;
  csc.numberOfLowDepthAdjacents = lowDepthAdjacents.length;
}

function recursivelyVisitCscAndCreateLinks(cscToVisit, visitedCscs, linkByLinkKey, originalCsc, depth) {
  visitedCscs.add(cscToVisit);
  if (depth > 0) {
    originalCsc.depthByAdjacentCsc.set(cscToVisit, depth);
  }
  cscToVisit.uniqueAdjacents.forEach((adjCsc) => {
    const link = { from: cscToVisit, to: adjCsc, isBidirectional: false, key: `${cscToVisit.shortKey}|${adjCsc.shortKey}`, depth };
    linkByLinkKey.set(link.key, link);
    if (!visitedCscs.has(adjCsc)) {
      recursivelyVisitCscAndCreateLinks(adjCsc, visitedCscs, linkByLinkKey, originalCsc, depth + 1);
    }
    else {
      const currentDepthOfThisCsc = originalCsc.depthByAdjacentCsc.get(adjCsc);
      if ((depth + 1) < currentDepthOfThisCsc) {
        originalCsc.depthByAdjacentCsc.set(adjCsc, depth + 1)
      }
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