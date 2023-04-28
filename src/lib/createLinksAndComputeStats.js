
export default function createLinksAndComputeStats(cscs, schedulingUnitDatesByCscKey, params) {
  cscs.forEach((csc) => {
    createIncomingLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, params);
    createOutgoingLinksAndComputeStatsForOneCsc(csc);
  });
}

export function createIncomingLinksAndComputeStatsForOneCsc(csc, schedulingUnitDatesByCscKey, {
  calendarThresholdDate,
  thresholdDepth
} = {}) {
  csc.allIncomingLoadCscs = new Set();
  csc.linkByLinkKey = new Map();
  csc.depthByIncomingLoadCsc = new Map();
  recursivelyVisitCscAndCreateLinks(csc, csc.allIncomingLoadCscs, csc.linkByLinkKey, csc, 0, 'incoming');
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

export function createOutgoingLinksAndComputeStatsForOneCsc(csc) {
  csc.allOutgoingLoadCscs = new Set();
  csc.outgoingLinkByLinkKey = new Map();
  csc.depthByOutgoingLoadCsc = new Map();
  recursivelyVisitCscAndCreateLinks(csc, csc.allOutgoingLoadCscs, csc.outgoingLinkByLinkKey, csc, 0, 'outgoing');
  simplifyBidirectionalLinks(csc.outgoingLinkByLinkKey);
  csc.totalNumberOfOutgoingLoadCscs = csc.allOutgoingLoadCscs.size - 1;
  csc.firstDegreeOutgoingLoadCscs = csc.outgoingLoadCscs?.length ?? 0;
  csc.firstDegreeOutgoingToOtherBookings = csc.outgoingLoadCscs?.filter((outCsc) => outCsc.cscBooking !== csc.cscBooking).length ?? 0;
}


const propNameByPropKeyByMode = {
  'incoming': {
    depthByAdjacentCsc: 'depthByIncomingLoadCsc',
    adjacentCscs: 'incomingLoadCscs',
  },
  'outgoing': {
    depthByAdjacentCsc: 'depthByOutgoingLoadCsc',
    adjacentCscs: 'outgoingLoadCscs',
  },
}

function recursivelyVisitCscAndCreateLinks(cscToVisit, visitedCscs, linkByLinkKey, originalCsc, depth, mode, maxDepth) {
  if (maxDepth && depth > maxDepth) return;
  const { depthByAdjacentCsc, adjacentCscs } = propNameByPropKeyByMode[mode];
  visitedCscs.add(cscToVisit);
  if (depth > 0) {
    originalCsc[depthByAdjacentCsc].set(cscToVisit, depth);
  }
  if (!cscToVisit[adjacentCscs]) return;
  cscToVisit[adjacentCscs].forEach((adjCsc) => {
    const link = { from: cscToVisit, to: adjCsc, isBidirectional: false, key: `${cscToVisit.shortKey}|${adjCsc.shortKey}`, depth };
    linkByLinkKey.set(link.key, link);
    if (!visitedCscs.has(adjCsc)) {
      recursivelyVisitCscAndCreateLinks(adjCsc, visitedCscs, linkByLinkKey, originalCsc, depth + 1, mode);
    }
    else {
      const currentDepthOfThisCsc = originalCsc[depthByAdjacentCsc].get(adjCsc);
      if ((depth + 1) < currentDepthOfThisCsc) {
        originalCsc[depthByAdjacentCsc].set(adjCsc, depth + 1)
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