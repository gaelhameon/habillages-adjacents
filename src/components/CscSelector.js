import React, { useEffect, useState } from 'react';

const CscSelector = ({ currentCscKey, data, setCurrentCscKey }) => {
  const { bookings, names, scenarios, schedTypes, cscByCscKey } = data;
  const firstCsc = Object.values(cscByCscKey)[0];
  const [valueByKeyPart, setValueByKeyPart] = useState({
    booking: firstCsc.cscBooking,
    name: firstCsc.cscName,
    scenario: firstCsc.cscScenario,
    schedType: firstCsc.cscSchedType,
  });
  const {
    booking, name, scenario, schedType
  } = valueByKeyPart;
  const handleChange = (keyPart, newValue) => {
    const newValueByKeyPart = ({ ...valueByKeyPart, [keyPart]: newValue });
    setValueByKeyPart(newValueByKeyPart);
    setCurrentCscKey(`${newValueByKeyPart.booking}-${newValueByKeyPart.name}-${newValueByKeyPart.schedType}-${newValueByKeyPart.scenario}`)
  }
  useEffect(() => {
    handleChange('booking', booking)
  }, [])
  return (
    <div className="">
      <CscKeyPartSelect id="bookings" choices={bookings} value={booking} onChange={(v) => handleChange('booking', v)} />
      <CscKeyPartSelect id="names" choices={names} value={name} onChange={(v) => handleChange('name', v)} />
      <CscKeyPartSelect id="schedTypes" choices={schedTypes} value={schedType} onChange={(v) => handleChange('schedType', v)} />
      <CscKeyPartSelect id="scenarios" choices={scenarios} value={scenario} onChange={(v) => handleChange('scenario', v)} />

      <input type="text" id="cscKey" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 w-1/3 focus:border-blue-500 p-2.5"
        value={currentCscKey}
        onChange={({ target }) => setCurrentCscKey(target.value)}
      />
    </div >
  );
};

const CscKeyPartSelect = ({ choices, id, onChange, value }) => {
  return (
    <select id={id}
      onChange={({ target }) => onChange(target.value)}
      value={value}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
      {choices.map((choice) => (<option value={choice} key={choice}>{choice}</option>))}
    </select>
  )
}



export default CscSelector;
