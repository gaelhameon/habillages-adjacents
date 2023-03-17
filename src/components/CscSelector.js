import React, { useEffect, useState } from 'react';

const CscSelector = ({ currentCscKey, data, setCurrentCscKey }) => {
  const { cscByCscKey, scenariosBySchedTypeByNameByBooking } = data;
  const firstCsc = Object.values(cscByCscKey)[0];
  const bookings = Object.keys(scenariosBySchedTypeByNameByBooking);
  const [valueByKeyPart, setValueByKeyPart] = useState({
    booking: firstCsc.cscBooking,
    name: firstCsc.cscName,
    scenario: firstCsc.cscScenario,
    schedType: firstCsc.cscSchedType,
  });
  const {
    booking, name, scenario, schedType
  } = valueByKeyPart;


  const scenariosBySchedTypeByName = scenariosBySchedTypeByNameByBooking[booking];
  const names = Object.keys(scenariosBySchedTypeByName);

  const scenariosBySchedType = scenariosBySchedTypeByName[name];
  const schedTypes = Object.keys(scenariosBySchedType);

  const scenarios = scenariosBySchedType[schedType];

  const handleChange = (keyPart, newValue) => {
    const requestedNewValueByKeyPart = ({ ...valueByKeyPart, [keyPart]: newValue });
    const newValueByKeyPart = computeNewValueByKeyPartForRequestedValueByKeyPart(
      requestedNewValueByKeyPart,
      scenariosBySchedTypeByNameByBooking,
    );

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

      <input type="text" id="cscKey"
        size={50}
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


function computeNewValueByKeyPartForRequestedValueByKeyPart(requestedNewValueByKeyPart, scenariosBySchedTypeByNameByBooking) {
  let { booking, name, schedType, scenario } = requestedNewValueByKeyPart;
  const scenariosBySchedTypeByName = scenariosBySchedTypeByNameByBooking[booking];

  let scenariosBySchedType = scenariosBySchedTypeByName[name];
  if (!scenariosBySchedType) {
    name = Object.keys(scenariosBySchedTypeByName)[0];
    scenariosBySchedType = scenariosBySchedTypeByName[name];
  }

  let scenarios = scenariosBySchedType[schedType];
  if (!scenarios) {
    schedType = Object.keys(scenariosBySchedType)[0];
    scenarios = scenariosBySchedType[schedType];
  }

  if (!scenarios.includes(scenario)) {
    scenario = scenarios[0];
  }

  return {
    booking,
    name,
    schedType,
    scenario,
  }
}

export default CscSelector;
