import { useEffect, useState } from 'react';
import Select from 'react-select';

const ConfigForm = ({ headers, onConfigChange }) => {
  const [groupBy, setGroupBy] = useState([]);
  const [columnField, setColumnField] = useState([]);
  const [sumColumn, setSumColumn] = useState([]);

  useEffect(() => {
    if (groupBy.length || columnField.length || sumColumn.length) {
      onConfigChange({
        groupBy: groupBy.map(option => option.value),
        columnField: columnField.map(option => option.value),
        sumColumn: sumColumn.map(option => option.value),
      });
    }
  }, [groupBy, columnField, sumColumn]);

  const options = headers.map(h => ({ value: h, label: h }));

  return (
    <div className="mb-6 grid gap-4 grid-cols-3 bg-purple-200 rounded pt-2 pb-5 px-3 text-sm shadow-md">
      <div>
        <label className="block font-semibold mb-1 text-center">Row</label>
        <Select
          isMulti
          options={options}
          className="w-full"
          onChange={setGroupBy}
          value={groupBy}
          styles={{
            multiValue: (styles) => ({
              ...styles,
              backgroundColor: '#F3E8FF', // light purple, change to any hex or tailwind color
            }),
          }}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Column</label>
        <Select
          isMulti
          options={options}
          className="w-full"
          onChange={setColumnField}
          value={columnField}
          styles={{
            multiValue: (styles) => ({
              ...styles,
              backgroundColor: '#F3E8FF', // light purple, change to any hex or tailwind color
            }),
          }}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Values</label>
        <Select
          isMulti
          options={options}
          className="w-full"
          onChange={setSumColumn}
          value={sumColumn}
          styles={{
            multiValue: (styles) => ({
              ...styles,
              backgroundColor: '#F3E8FF', // light purple, change to any hex or tailwind color
            }),
          }}
        />
      </div>
    </div>
  );
};

export default ConfigForm;




