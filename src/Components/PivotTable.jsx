import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

const COLUMN_WIDTH = 120;

const PivotTable = ({ data, groupBy = [], columnField = [], sumColumn }) => {
  const pivot = useMemo(() => {
    const columnSet = new Set();
    const columnMap = new Map();
    const rowMap = new Map();
    const columnTotals = {};

    data.forEach(row => {
      const rowKey = groupBy.map(key => row[key]).join('|');
      // console.log("rowkey", rowKey);
      
      const colKeyParts = columnField.map(col => row[col]);
      //['North', 'maize']  
      const colKey = colKeyParts.join('|');
      //North|maize     
      const value = parseFloat(row[sumColumn]) || 0;

      columnSet.add(colKey);
      // {'West|wheat', 'North|maize', 'South|rice', 'North|tea', 'East|tea', …}
      columnMap.set(colKey, colKeyParts);
//       {"West|wheat" => Array(2)}
//       key : "West|wheat"
//       value : (2) ['West', 'wheat']
// columnMap: {
//   'North|Tea': ['North', 'Tea'],
//   'North|Coffee': ['North', 'Coffee'],
//   'South|Tea': ['South', 'Tea'],
// }

      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, {});
      } //Supplier A: {}

      const existing = rowMap.get(rowKey); 
      existing[colKey] = (existing[colKey] || 0) + value; 
      //rowmap:  "Supplier A" : { 
      // North|maize : 100,
      // North|Tea : 200 
      //  }
      columnTotals[colKey] = (columnTotals[colKey] || 0) + value; //{ North|maize : 100, North|Tea : 150 }
    });
    //columns = ["North|maize", "North|Tea", "South|maize"]

    const columns = Array.from(columnSet).sort();
    const rows = Array.from(rowMap.entries()).map(([rowKey, colValues]) => ({ //has rowkeyparts : [Supplier A] values : [100,200] rowkeyparts : [Supplier B] values : [0,150]
      rowKeyParts: rowKey.split('|'),
      values: columns.map(col => colValues[col] || 0),
    }));

    rows.push({
      rowKeyParts: groupBy.length > 0 ? ['Total', ...Array(groupBy.length - 1).fill('')] : ['Total'],
      values: columns.map(col => columnTotals[col] || 0),
    });
    //roykeyparts : [Total]  values : [100, 350]

    return { columns, rows, columnMap };
  }, [data, groupBy, columnField, sumColumn]);

  // final pivot obj : 
  // pivot = {
  //   columns: ['North|maize', 'North|Tea', 'South|Tea'],
  //   rows: [
  //     { rowKeyParts: ['Supplier A'], values: [150, 100, 0] },
  //     { rowKeyParts: ['Supplier B'], values: [0, 0, 200] },
  //   ],
  // columnMap: {
//   'North|Tea': ['North', 'Tea'],
//   'North|Coffee': ['North', 'Coffee'],
//   'South|Tea': ['South', 'Tea'],
// }
  // }
  

  const totalWidth = (groupBy.length + pivot.columns.length) * COLUMN_WIDTH;

  const getGroupedHeaders = (columns, columnMap, level) => { //colKey, .. , ..
    const groups = [];
    let prev = null;
    let count = 0;

    for (const colKey of columns) {
      const parts = columnMap.get(colKey) || []; //["North", "Tea"]
      const label = parts[level] || ''; //top header "North"
      
      if (label === prev) {
        count++;
      } else {
        if (prev !== null) {
          groups.push({ label: prev, count });
        }
        prev = label;
        count = 1;
      }
    }

    if (prev !== null) {
      groups.push({ label: prev, count });
    }

// [
//   { label: 'North', count: 2 },
//   { label: 'South', count: 1 }
// ]
    return groups;
  };

  const Row = ({ index, style }) => {
    if (index === 0 && columnField.length > 1) {
      // Multi-level header
      return (
        <div style={{ ...style, width: totalWidth }}>
          {/* First header row */}
          <div className="flex bg-purple-300 font-bold">
            {groupBy.map((label, i) => (
              <div
                key={`grp-${i}`}
                style={{ width: COLUMN_WIDTH, padding: '4px', borderRight: '1px solid #ccc' }}
                className="border text-center"
              >
                {label}
              </div>
            ))}
            {getGroupedHeaders(pivot.columns, pivot.columnMap, 0).map((group, i) => (
              <div
                key={`colGroup-${i}`}
                style={{ width: group.count * COLUMN_WIDTH, textAlign: 'center', padding: '4px' }}
                className="border"
              >
                {group.label}
              </div>
            ))}
          </div>

          {/* Second header row */}
          <div className="flex bg-purple-200 font-semibold">
            {groupBy.map((_, i) => (
              <div key={`spacer-${i}`} style={{ width: COLUMN_WIDTH }} className="border" />
            ))}
            {pivot.columns.map((colKey, i) => {
              const parts = pivot.columnMap.get(colKey);
              return (
                <div
                  key={`subCol-${i}`}
                  style={{ width: COLUMN_WIDTH, padding: '4px', textAlign: 'center' }}
                  className="border"
                >
                  {parts[1]}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (index === 0) {
      // Single-level column header
      return (
        <div className="flex bg-purple-200 font-bold w-max" style={{ ...style, width: totalWidth }}>
          {groupBy.map((label, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
              {label}
            </div>
          ))}
          {pivot.columns.map((col, i) => (
            <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
              {col}
            </div>
          ))}
        </div>
      );
    }

    const row = pivot.rows[index - (columnField.length > 1 ? 2 : 1)];
    if (!row) return null;
  //   rows: [
  //     { rowKeyParts: ['Supplier A'], values: [150, 100, 0] },
  //     { rowKeyParts: ['Supplier B'], values: [0, 0, 200] },
  //   ], ==> rendered as : Supplier A | 150 | 100 | 0
    return (
      <div className={`flex w-max border-0 border-gray-300 ${index % 2 === 0 ? `bg-purple-100` : ""}`} style={{ ...style, width: totalWidth }}>
        {row.rowKeyParts.map((part, i) => (
          <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
            {part}
          </div>
        ))}
        {row.values.map((val, i) => (
          <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
            {val}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 rounded">
      <List
        height={380}
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
