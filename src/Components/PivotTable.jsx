import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
//total
const COLUMN_WIDTH = 160;

const PivotTable = ({ data, groupBy = [], columnField = [], sumColumn = [], aggFunction }) => {

  if (groupBy.length === 0 && columnField.length === 0 && sumColumn.length === 0) {
    return null;
  }

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

      columnSet.add(colKey);
      columnMap.set(colKey, colKeyParts);

      if (!rowMap.has(rowKey)) rowMap.set(rowKey, {});
      const existing = rowMap.get(rowKey);
      // "North" -> { "Laptop": { "Total Revenue": [50000.55] } }

      if (sumColumn.length > 0) {
        sumColumn.forEach(sumCol => {
          const rawValue = row[sumCol];
          const value = parseFloat(rawValue);
          const isValidNumber = !isNaN(value);

          if (!existing[colKey]) existing[colKey] = {};
          if (!existing[colKey][sumCol]) existing[colKey][sumCol] = [];

          if (aggFunction === 'count') {
            existing[colKey][sumCol].push(1);
            columnTotals[`${colKey}|${sumCol}`] = (columnTotals[`${colKey}|${sumCol}`] || 0) + 1;
          } else if (isValidNumber) {
            existing[colKey][sumCol].push(value);
            columnTotals[`${colKey}|${sumCol}`] = (columnTotals[`${colKey}|${sumCol}`] || 0) + value;
            columnCounts[`${colKey}|${sumCol}`] = (columnCounts[`${colKey}|${sumCol}`] || 0) + 1;
          }
          //columntotals : "Laptop|Total Revenue" -> 50000.5
          //columncounts : "Laptop|Total Revenue" -> 1
        });
      } else {
        // If no sumColumn selected, still mark presence
        if (!existing[colKey]) existing[colKey] = { _dummy: [1] };
      }
    });

    const columns = Array.from(columnSet).sort();
    //Converts columnSet to an array and sorts it (e.g., ["Bookshelf", "Desk", "Desk Chair", "Laptop", "Smartphone", "Tablet"])

    const rows = Array.from(rowMap.entries()).map(([rowKey, colValues]) => {
      // rows: Maps over rowMap to generate rows with calculated values.
      // For "North":
      // rowKeyParts: ["North"]
      // values: ["", "", "", "50000.55", "4199.94", ""]
      // For "South":
      // rowKeyParts: ["South"]
      // values: ["", "1199.92", "", "", "", "629.93"]
      // For "East":
      // rowKeyParts: ["East"]
      // values: ["", "", "7199.92", "", "3149.91", ""]

      const values = columns.flatMap(col => {
        if (sumColumn.length > 0) {
          return sumColumn.map(sumCol => {
            const arr = colValues[col]?.[sumCol] || [];
            if (aggFunction === 'sum') return arr.reduce((a, b) => (a + b), 0).toFixed(2);
            if (aggFunction === 'count') return arr.length;
            if (aggFunction === 'avg') return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
            return 0;
          });
        } else {
          return [colValues[col] ? '' : ''];
        }
      });

      return {
        rowKeyParts: rowKey.split('|'),
        values,
      };
    });

    rows.push({
      rowKeyParts: groupBy.length > 0 ? ['Grand Total', ...Array(groupBy.length - 1).fill('')] : ['Total'],
      // rowKeyParts: groupBy.length > 0 ? ['Grand Total', ...Array(groupBy.length - 1).fill('')] : ['Total'],
      // Total Row: Adds a total row with aggregated values for each column.
      // rowKeyParts: ["Total"]
      // values: ["1499.95", "2999.8", "7199.92", "50000.55", "4199.94", "629.93"]
      values: columns.flatMap(col => {
        if (sumColumn.length > 0) {
          return sumColumn.map(sumCol => {
            if (aggFunction === 'sum' || aggFunction === 'count') {
              return (columnTotals[`${col}|${sumCol}`] || 0).toFixed(2);
            } else if (aggFunction === 'avg') {
              const sum = columnTotals[`${col}|${sumCol}`] || 0;
              const count = columnCounts[`${col}|${sumCol}`] || 0;
              return count ? (sum / count).toFixed(2) : 0;
            }
            return 0;
          });
        } else {
          return [''];
        }
      }),
    });

    return { columns, rows, columnMap };
  }, [data, groupBy, columnField, sumColumn, aggFunction]);

  const totalWidth = (groupBy.length + pivot.columns.length * (sumColumn.length || 1)) * COLUMN_WIDTH;

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
              <div key={i} style={{ width: group.count * COLUMN_WIDTH * (sumColumn.length || 1) }} className="border text-center">
                {group.label}
              </div>
            ))}
          </div>
          <div className="flex bg-purple-200 font-semibold">
            {groupBy.map((_, i) => (
              <div key={i} style={{ width: COLUMN_WIDTH }} className="border" />
            ))}
            {pivot.columns.flatMap((colKey, i) => {
              const parts = pivot.columnMap.get(colKey);
              return (sumColumn.length > 0 ? sumColumn : ['']).map((sumCol, j) => (
                <div key={`${i}-${j}`} style={{ width: COLUMN_WIDTH, padding: '4px' }} className={`border text-center measure-heading`}>
                  {parts[1]}{sumCol && ` (${sumCol})`}
                </div>
              ));
            })}
          </div>
        </div>
      );
    }

    if (index === 0) {
      return (
        <div className="flex bg-purple-200 font-bold w-max measure-heading" style={{ ...style, width: totalWidth }}>
          {groupBy.map((label, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="border text-center">
              {label}
            </div>
          ))}
          {pivot.columns.flatMap((col, i) => (
            (sumColumn.length > 0 ? sumColumn : ['']).map((sumCol, j) => (
              <div key={`${i}-${j}`} style={{ width: COLUMN_WIDTH, padding: '4px' }} className={`border text-center measure-heading`}>
                {col}{sumCol && ` (${sumCol})`}
              </div>
            ))
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
        height={320}
        width={600}
        itemCount={pivot.rows.length + (columnField.length > 1 ? 2 : 1)}
        itemSize={40}
      >
        {Row}
      </List>
    </div>
  );
};

export default PivotTable;


