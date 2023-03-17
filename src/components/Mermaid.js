import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const DEFAULT_CONFIG = {
  startOnLoad: true,
  logLevel: 'fatal',
  securityLevel: 'strict',
  arrowMarkerAbsolute: false,
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    rankSpacing: 30,
    nodeSpacing: 30,
    diagramPadding: 5,
    useMaxWidth: true,
  },
};

const Mermaid = ({ name, chart, config }) => {
  const svgWrapperRef = useRef();

  useEffect(() => {
    mermaid.initialize({ ...DEFAULT_CONFIG, ...config });
  }, [config]);

  useEffect(() => {
    try {
      mermaid.render('mermaid', chart, (newSvg) => {
        svgWrapperRef.current.innerHTML = newSvg;
      });
    } catch (error) {
      alert(`Erreur dans le calcul du graph. Il y a probablement des caractères invalides dans le nom de votre Habillage`)
    }

  }, [chart]);

  return (
    <div name={name} data-cy={'mermaid-chart'} ref={svgWrapperRef}>
    </div>
  );
};

export default Mermaid;
