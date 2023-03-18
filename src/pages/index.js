import { useState } from 'react';

import OirDataFilesPicker from '../components/OirDataFilesPicker';
import CscSelector from '../components/CscSelector';
import { parseAndCleanData } from '../lib/parseAndCleanData';
import getMermaidStringForCsc from '../lib/getMermaidStringForCsc';
import Mermaid from '../components/Mermaid';
import CscDataGrid from '@/components/CscDataGrid';

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
          {/* <pre>{mermaidString}</pre> */}
          <Mermaid chart={mermaidString} name="liens" config={{}} />
          <CscDataGrid cscByCscKey={cscByCscKey} />
        </div>
      ) : (
        <OirDataFilesPicker handleData={handleData} />
      )}
      <div>
        <p>Notes de mise à jour</p>
        <ul>
          <li>v1.8.0 - 18/03/2023 - Un tableau affiche les habillages et certaines statistiques</li>
          <li>v1.7.0 - 17/03/2023 - L'unité horaire et le contexte de service, ainsi que la date d'enregistrement et l'utilisateur sont désormais affichés</li>
          <li>v1.6.0 - 17/03/2023 - Une légende est désormais affichée</li>
          <li>v1.5.0 - 17/03/2023 - Les habillages sont désormais colorés en fonction de leur région d'appartenance</li>
          <li>v1.4.0 - 17/03/2023 - Les liens bijectifs apparaissent désormais en bleu gras</li>
          <li>v1.3.0 - 17/03/2023 - Les menus déroulants sont désormais triés en ordre alphabétique</li>
          <li>v1.2.0 - 17/03/2023 - Les liens bijectifs sont désormais représentés par un seul trait sans flèches</li>
          <li>v1.1.0 - 17/03/2023 - Les menus déroulants n'affichent désormais que des valeurs valides</li>
        </ul>
      </div>
    </div>
  );
}

export default Index;
