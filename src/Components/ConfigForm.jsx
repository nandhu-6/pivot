
import { useEffect, useState } from 'react';

const ConfigForm = ({ headers, onConfigChange }) => {
  const [groupBy, setGroupBy] = useState(''); //groupBy rows
  const [columnField, setColumnField] = useState('');
  const [sumColumn, setSumColumn] = useState('');

  useEffect(() => {
    if (groupBy || sumColumn || columnField) {
      onConfigChange({ groupBy, sumColumn, columnField });
    }
  }, [groupBy, sumColumn, columnField]);

  return (
    <div className="mb-6 grid gap-4 grid-cols-3 bg-purple-100 rounded pt-2 pb-5 px-3">
      <div>
        <label className="block font-semibold mb-1 text-center">Row</label>
        <select
          className="w-full p-2 border rounded bg-gray-50"
          onChange={(e) => setGroupBy(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select Row</option>
          {headers.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Column</label>
        <select
          className="w-full p-2 border rounded bg-gray-50"
          onChange={(e) => setColumnField(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select Column</option>
          {headers.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-center">Values</label>
        <select
          className="w-full p-2 border rounded bg-gray-50"
          onChange={(e) => setSumColumn(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select Measure</option>
          {headers.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConfigForm;
