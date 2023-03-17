export default function getMermaidStringForCsc(csc) {
  const visitedCscs = new Set();
  const links = [];
  recursivelyVisitCscAndAddLinks(csc, visitedCscs, links);
  return `graph TD\n${links.join('\n')}`
}






function recursivelyVisitCscAndAddLinks(cscToVisit, visitedCscs, links) {
  visitedCscs.add(cscToVisit);
  cscToVisit.uniqueAdjacents.forEach((adjCsc) => {
    links.push(`${cscToVisit.shortKey}[${cscToVisit.cscKey}] --> ${adjCsc.shortKey}[${adjCsc.cscKey}]`);
    if (!visitedCscs.has(adjCsc)) {
      recursivelyVisitCscAndAddLinks(adjCsc, visitedCscs, links);
    }
  });
}

