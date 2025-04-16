import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

const COLUMN_WIDTH = 150;

const PivotTable = ({ data, groupBy = [], columnField = [], sumColumn, aggFunction }) => {
  const pivot = useMemo(() => {
    const columnSet = new Set();
    const columnMap = new Map();
    const rowMap = new Map();
    const columnTotals = {};
    const columnCounts = {};

    data.forEach(row => {
      const rowKey = groupBy.map(key => row[key]).join('|');
      const colKeyParts = columnField.map(col => row[col]);
      const colKey = colKeyParts.join('|');
      const rawValue = row[sumColumn];

      const value = parseFloat(rawValue);
      const isValidNumber = !isNaN(value);

      columnSet.add(colKey);
      columnMap.set(colKey, colKeyParts);

      if (!rowMap.has(rowKey)) rowMap.set(rowKey, {});
      const existing = rowMap.get(rowKey);

      if (!existing[colKey]) existing[colKey] = [];

      if (aggFunction === 'count') {
        existing[colKey].push(1);
        columnTotals[colKey] = (columnTotals[colKey] || 0) + 1;
      } else if (isValidNumber) {
        existing[colKey].push(value);
        columnTotals[colKey] = (columnTotals[colKey] || 0) + value;
        columnCounts[colKey] = (columnCounts[colKey] || 0) + 1;
      }
    });

    const columns = Array.from(columnSet).sort();

    const rows = Array.from(rowMap.entries()).map(([rowKey, colValues]) => {
      const values = columns.map(col => {
        const arr = colValues[col] || [];
        if (aggFunction === 'sum') return arr.reduce((a, b) => a + b, 0);
        if (aggFunction === 'count') return arr.length;
        if (aggFunction === 'avg') return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
        return 0;
      });

      return {
        rowKeyParts: rowKey.split('|'),
        values,
      };
    });

    rows.push({
      rowKeyParts: groupBy.length > 0 ? ['Total', ...Array(groupBy.length - 1).fill('')] : ['Total'],
      values: columns.map(col => {
        if (aggFunction === 'sum' || aggFunction === 'count') {
          return columnTotals[col] || 0;
        } else if (aggFunction === 'avg') {
          const sum = columnTotals[col] || 0;
          const count = columnCounts[col] || 0;
          return count ? (sum / count).toFixed(2) : 0;
        }
        return 0;
      }),
    });

    return { columns, rows, columnMap };
  }, [data, groupBy, columnField, sumColumn, aggFunction]);

  const totalWidth = (groupBy.length + pivot.columns.length) * COLUMN_WIDTH;

  const getGroupedHeaders = (columns, columnMap, level) => {
    const groups = [];
    let prev = null;
    let count = 0;

    for (const colKey of columns) {
      const parts = columnMap.get(colKey) || [];
      const label = parts[level] || '';
      if (label === prev) {
        count++;
      } else {
        if (prev !== null) groups.push({ label: prev, count });
        prev = label;
        count = 1;
      }
    }
    if (prev !== null) groups.push({ label: prev, count });
    return groups;
  };

  const Row = ({ index, style }) => {
    if (index === 0 && columnField.length > 1) {
      return (
        <div style={{ ...style, width: totalWidth }}>
          <div className="flex bg-purple-300 font-bold">
            {groupBy.map((label, i) => (
              <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
                {label}
              </div>
            ))}
            {getGroupedHeaders(pivot.columns, pivot.columnMap, 0).map((group, i) => (
              <div key={i} style={{ width: group.count * COLUMN_WIDTH }} className="border text-center">
                {group.label}
              </div>
            ))}
          </div>
          <div className="flex bg-purple-200 font-semibold">
            {groupBy.map((_, i) => (
              <div key={i} style={{ width: COLUMN_WIDTH }} className="border" />
            ))}
            {pivot.columns.map((colKey, i) => {
              const parts = pivot.columnMap.get(colKey);
              return (
                <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
                  {parts[1]}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (index === 0) {
      return (
        <div className="flex bg-purple-200 font-bold w-max" style={{ ...style, width: totalWidth }}>
          {groupBy.map((label, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
              {label}
            </div>
          ))}
          {pivot.columns.map((col, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
              {col}
            </div>
          ))}
        </div>
      );
    }

    const row = pivot.rows[index - (columnField.length > 1 ? 2 : 1)];
    if (!row) return null;

    return (
      <div className={`flex w-max ${index % 2 === 0 ? `bg-purple-100` : ""}`} style={{ ...style, width: totalWidth }}>
        {row.rowKeyParts.map((part, i) => (
          <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
            {part}
          </div>
        ))}
        {row.values.map((val, i) => (
          <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
            {val}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 rounded">
      <List
        height={350}
        width={600}
        itemCount={pivot.rows.length + (columnField.length > 1 ? 2 : 1)}
        itemSize={30}
      >
        {Row}
      </List>
    </div>
  );
};

export default PivotTable;
