
export default function createLinksAndComputeStats(cscs, schedulingUnitDatesByCscKey, params) {
  cscs.forEach((csc) => createLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, params));
}


export function createLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, {
  calendarThresholdDate,
  thresholdDepth
} = {}) {
  csc.allIncomingLoadCscs = new Set();
  csc.linkByLinkKey = new Map();
  csc.depthByIncomingLoadCsc = new Map();
  recursivelyVisitCscAndCreateLinks(csc, csc.allIncomingLoadCscs, csc.linkByLinkKey, csc, 0);
  simplifyBidirectionalLinks(csc.linkByLinkKey);
  csc.totalNumberOfIncomingLoadCscs = csc.allIncomingLoadCscs.size - 1;
  csc.firstDegreeIncomingLoadCscs = csc.incomingLoadCscs.length;

  const schedulingUnitDatesOfCsc = schedulingUnitDatesByCscKey[csc.cscKey] ?? [];
  const schedulingUnitDatesOfCscAfterThresholdDate = schedulingUnitDatesOfCsc.filter((schedUnitDate) => schedUnitDate.dateAsDate >= calendarThresholdDate)
  csc.numberOfDatesInCalAfterThresholdDate = schedulingUnitDatesOfCscAfterThresholdDate.length;

  const incomingCscAndDepthInfos = Array.from(csc.depthByIncomingLoadCsc.entries()).map(([adjacentCsc, depth]) => ({ adjacentCsc, depth }));
  const lowDepthIncoming = incomingCscAndDepthInfos.filter(({ depth }) => {
    return depth <= thresholdDepth;
  });
  const oldSaveDateCscAndDepthInfos = incomingCscAndDepthInfos.filter(({ adjacentCsc }) => {
    return adjacentCsc.isOld;
  });
  const oldSaveDateAndDepthLessThanTwoCscAndDepthInfos = oldSaveDateCscAndDepthInfos.filter(({ depth }) => depth <= thresholdDepth);
  csc.numberOfOldSaveDateIncoming = oldSaveDateCscAndDepthInfos.length;
  csc.numberOfOldSaveDateAndLowDepthIncoming = oldSaveDateAndDepthLessThanTwoCscAndDepthInfos.length;
  csc.numberOfLowDepthIncoming = lowDepthIncoming.length;
}

function recursivelyVisitCscAndCreateLinks(cscToVisit, visitedCscs, linkByLinkKey, originalCsc, depth) {
  visitedCscs.add(cscToVisit);
  if (depth > 0) {
    originalCsc.depthByIncomingLoadCsc.set(cscToVisit, depth);
  }
  cscToVisit.incomingLoadCscs.forEach((adjCsc) => {
    const link = { from: cscToVisit, to: adjCsc, isBidirectional: false, key: `${cscToVisit.shortKey}|${adjCsc.shortKey}`, depth };
    linkByLinkKey.set(link.key, link);
    if (!visitedCscs.has(adjCsc)) {
      recursivelyVisitCscAndCreateLinks(adjCsc, visitedCscs, linkByLinkKey, originalCsc, depth + 1);
    }
    else {
      const currentDepthOfThisCsc = originalCsc.depthByIncomingLoadCsc.get(adjCsc);
      if ((depth + 1) < currentDepthOfThisCsc) {
        originalCsc.depthByIncomingLoadCsc.set(adjCsc, depth + 1)
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