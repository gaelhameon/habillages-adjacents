import { useState } from 'react';

import FilesPicker from '../components/FilesPicker';
import CscSelector from '../components/CscSelector';
import { parseAndCleanData } from '../lib/parseAndCleanData';
import getMermaidStringForCsc from '../lib/getMermaidStringForCsc';
import Mermaid from '../components/Mermaid';
import CscDataGrid from '@/components/CscDataGrid';

export function Index() {
  const [cleanData, setCleanData] = useState({});
  const [currentCscKey, setCurrentCscKey] = useState('');
  const [mermaidString, setMermaidString] = useState('graph TD\nA--->B');

  const handleData = async (data) => {
    const cleanData = await parseAndCleanData(data);
    setCleanData(cleanData);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { cscByCscKey } = cleanData;

  const refreshMermaidString = (cscKey) => {
    const csc = cscByCscKey[cscKey];
    if (!csc) {
      alert(`Identifiant d'habillage invalide: ${cscKey}`);
    } else {
      const mermaidString = getMermaidStringForCsc(cscByCscKey[cscKey]);
      setMermaidString(mermaidString);
    }
  };



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
            onClick={() => refreshMermaidString(currentCscKey)}
          >
            Actualiser le graphique
          </button>
          {/* <pre>{mermaidString}</pre> */}
          <Mermaid chart={mermaidString} name="liens" config={{}} />
          <CscDataGrid cscByCscKey={cscByCscKey} handleDataGridRowClick={refreshMermaidString} />
        </div>
      ) : (
        <FilesPicker handleData={handleData} />
      )}
      <div style={{ fontFamily: 'sans-serif' }}>
        <p>Notes de mise à jour</p>
        <ul>
          <li>v1.10.0 - 27/03/2023 - On peut désormais charger les données directement à partir d'un fichier zip (contenant un oir et un fichier de données)</li>
          <li>v1.9.1 - 20/03/2023 - Un bug concernant les habillages dont tous les liens sont bijectifs a été corrigé</li>
          <li>v1.9.0 - 18/03/2023 - Des filtres de base ont été ajoutés au tableau. Un clic sur une ligne du tableau affiche le graphique correspondant</li>
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
