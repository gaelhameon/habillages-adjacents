import { useCallback, useState } from 'react';

import ReactDatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import fr from 'date-fns/locale/fr';
registerLocale('fr', fr)

import FilesPicker from '../components/FilesPicker';
import CscSelector from '../components/CscSelector';
import { parseAndCleanCscData } from '../lib/parseAndCleanCscData';
import { parseAndCleanCalData } from '../lib/parseAndCleanCalData';
import getMermaidStringForCsc from '../lib/getMermaidStringForCsc';
import Mermaid from '../components/Mermaid';
import CscDataGrid from '@/components/CscDataGrid';

export function Index() {
  const [rawCscData, setRawCscData] = useState({});
  const [cleanCscData, setCleanCscData] = useState({});
  const [cleanCalData, setCleanCalData] = useState({});
  const [currentCscKey, setCurrentCscKey] = useState('');
  const [mermaidString, setMermaidString] = useState('graph TD\nA--->B');
  const [oldSaveThresholdDate, setOldSaveThresholdDate] = useState(new Date(2023, 2, 15));
  const [calendarThresholdDate, setCalendarThresholdDate] = useState(new Date());
  const [thresholdDepth, setThresholdDepth] = useState(2);

  const handleRawCscData = async (data) => {
    console.log(`Handling raw csc data`)
    setRawCscData(data);
    updateCleanCscData(data);
  };

  const updateCleanCscData = async (data) => {
    const cleanData = await parseAndCleanCscData(data, oldSaveThresholdDate);
    console.log(`setting cleandata`);
    console.log(cleanData);
    setCleanCscData(cleanData);
  };

  const handleCalData = async (data) => {
    const cleanData = await parseAndCleanCalData(data);
    setCleanCalData(cleanData);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { cscByCscKey } = cleanCscData;
  const { schedulingUnitDatesByCscKey } = cleanCalData;

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
    <div style={{ fontFamily: 'sans-serif' }}>
      {cscByCscKey ? (
        <div>
          <CscSelector
            currentCscKey={currentCscKey}
            setCurrentCscKey={setCurrentCscKey}
            data={cleanCscData}
          />{' '}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => refreshMermaidString(currentCscKey)}
          >
            Actualiser le graphique
          </button>
          {/* <pre>{mermaidString}</pre> */}
          <Mermaid chart={mermaidString} name="liens" config={{}} />
          <CscDataGrid
            cscByCscKey={cscByCscKey}
            schedulingUnitDatesByCscKey={schedulingUnitDatesByCscKey}
            oldSaveThresholdDate={oldSaveThresholdDate}
            calendarThresholdDate={calendarThresholdDate}
            thresholdDepth={thresholdDepth}
            handleDataGridRowClick={refreshMermaidString} />
        </div>
      ) : (
        <FilesPicker handleData={handleRawCscData} text={`Habillages: glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers`} />
      )}
      {schedulingUnitDatesByCscKey ? (
        null
      ) : (
        <FilesPicker handleData={handleCalData} text={`Calendriers: glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers`} />
      )}

      <div>
        Date avant laquelle les habillages sont considérés comme "vieux":
        <ReactDatePicker selected={oldSaveThresholdDate} onChange={(date) => setOldSaveThresholdDate(date)} locale="fr" dateFormat="dd/MM/yyyy" />
      </div>
      <div>
        Date à partir de laquelle on cherche les habillages dans le calendrier":
        <ReactDatePicker selected={calendarThresholdDate} onChange={(date) => setCalendarThresholdDate(date)} locale="fr" dateFormat="dd/MM/yyyy" />
      </div>
      <div>
        Profondeur en dessous de laquelle les habillages sont considérés comme "proches":
        <input value={thresholdDepth} onChange={({ target }) => setThresholdDepth(target.value)} />
      </div>
      <button onClick={() => updateCleanCscData(rawCscData)}>Actualiser</button>
      <div>
        <p>Notes de mise à jour</p>
        <ul>
          <li>v1.13.0 - 05/04/2023 - Ajout de liens de téléchargement vers des exemples d'OIG/OIR</li>
          <li>v1.12.0 - 05/04/2023 - Certains paramètres de calcul des statistiques sont à la main des utilisateurs</li>
          <li>v1.11.0 - 04/04/2023 - Plusieurs nouveautés:
            <ul>
              <li>On peut désormais charger des données exportées depuis les calendriers pour avoir des statistiques sur la présence des habillages dans les calendriers</li>
              <li>Des colonnes de statistiques ont été ajoutées</li>
              <li>L'habillage "principal" du schéma est mis en évidence par une bordure noire</li>
              <li>Les habillages dont la date d'enregistrement est antérieure au 15/03/2023 sont mis en évidence par une bordure rouge</li>
            </ul>
          </li>
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
      <ul>
        <li><a href='/cal_hab.id'>Exemple d'OIG pour Calendrier</a></li>
        <li><a href='/cal_hab.oir'>Exemple d'OIR pour Calendrier</a></li>
        <li><a href='/habillages_adj.id'>Exemple d'OIG pour Habillages</a></li>
        <li><a href='/habillages_adj.oir'>Exemple d'OIR pour Habillages</a></li >
      </ul >
    </div >
  );
}

export default Index;
