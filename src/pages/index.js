import { useState } from 'react';

import OirDataFilesPicker from '../components/OirDataFilesPicker';
import CscSelector from '../components/CscSelector';
import { parseAndCleanData } from '../lib/parseAndCleanData';
import getMermaidStringForCsc from '../lib/getMermaidStringForCsc/getMermaidStringForCsc';
import Mermaid from '../components/Mermaid';

export function Index() {
  const [cleanData, setCleanData] = useState({});
  const [currentCscKey, setCurrentCscKey] = useState('');
  console.log(currentCscKey);

  const [mermaidString, setMermaidString] = useState('graph TD\nA--->B');

  const handleData = async (data) => {
    const cleanData = await parseAndCleanData(data);
    console.log(cleanData);
    setCleanData(cleanData);
  };

  const refreshMermaidString = () => {
    console.log(currentCscKey);
    const currentCsc = cscByCscKey[currentCscKey];
    if (!currentCsc) {
      alert(`Identifiant d'habillage invalide`);
    } else {
      const mermaidString = getMermaidStringForCsc(cscByCscKey[currentCscKey]);
      setMermaidString(mermaidString);
    }
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { cscByCscKey } = cleanData;

  return (
    <div>
      {cscByCscKey ? (
        <div>
          <CscSelector
            currentCscKey={currentCscKey}
            setCurrentCscKey={setCurrentCscKey}
            data={cleanData}
          />{' '}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={refreshMermaidString}
          >
            Actualiser le graphique
          </button>
          <Mermaid chart={mermaidString} name="liens" config={{}} />
        </div>
      ) : (
        <OirDataFilesPicker handleData={handleData} />
      )}
    </div>
  );
}

export default Index;
