import { useEffect, useState } from 'react';
import Select from 'react-select';

const ConfigForm = ({ headers, onConfigChange }) => {
  const [groupBy, setGroupBy] = useState([]);
  const [columnField, setColumnField] = useState([]);
  const [sumColumn, setSumColumn] = useState([]);
  const [aggFunction, setAggFunction] = useState({ value: 'sum', label: 'Sum' });

  useEffect(() => {
    if (groupBy.length || columnField.length || sumColumn.length) {
      onConfigChange({
        groupBy: groupBy.map(option => option.value),
        columnField: columnField.map(option => option.value),
        sumColumn: sumColumn.length > 0 ? sumColumn[0].value : null,
        aggFunction: aggFunction.value
      });
    }
  }, [groupBy, columnField, sumColumn, aggFunction]);

  const options = headers.map(h => ({ value: h, label: h }));
  const aggOptions = [
    { value: 'sum', label: 'Sum' },
    { value: 'count', label: 'Count' },
    { value: 'avg', label: 'Average' }
  ];

  return (
    <div className="mb-6 grid gap-4 grid-cols-3 bg-purple-200 rounded pt-2 pb-5 px-3 text-sm shadow-md">
      <div>
        <label className="block font-semibold mb-1 text-center">Row</label>
        <Select isMulti options={options} value={groupBy} onChange={setGroupBy} />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Column</label>
        <Select isMulti options={options} value={columnField} onChange={setColumnField} />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Value</label>
        <Select options={options} value={sumColumn} onChange={val => setSumColumn([val])} />
      </div>
      <div className="col-span-3">
        <label className="block font-semibold mb-1 text-center">Aggregation</label>
        <Select options={aggOptions} value={aggFunction} onChange={setAggFunction} />
      </div>
    </div>
  );
};

export default ConfigForm;
