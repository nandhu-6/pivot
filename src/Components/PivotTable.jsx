import React, { useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

const COLUMN_WIDTH = 120;

const PivotTable = ({ data, groupBy, columnField, sumColumn }) => {
  const pivot = useMemo(() => {
    const rowMap = new Map();
    const columnSet = new Set();

    data.forEach(row => {
      const rowKey = row[groupBy];
      const colKey = row[columnField];
      const value = parseFloat(row[sumColumn]) || 0;

      columnSet.add(colKey);

      if (!rowMap.has(rowKey)) rowMap.set(rowKey, {});
      const rowData = rowMap.get(rowKey);
      rowData[colKey] = (rowData[colKey] || 0) + value;
    });

    const columns = Array.from(columnSet);
    const rows = Array.from(rowMap.entries()).map(([rowKey, colValues]) => ({
      rowKey,
      values: columns.map(col => colValues[col] || 0)
    }));

    return { columns, rows };
  }, [data, groupBy, columnField, sumColumn]);

  const scrollRef = useRef(null);
  const totalWidth = pivot.columns.length * COLUMN_WIDTH;

  const Row = ({ index, style }) => {
    if (index === 0) {
      // Header row
      return (
        <div
          ref={scrollRef}
          className="flex bg-purple-100 font-bold w-max"
          style={{ ...style, width: totalWidth }}
        >
          <div style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
            {groupBy}
          </div>
          {pivot.columns.map((col, idx) => (
            <div key={idx} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
              {col}
            </div>
          ))}
        </div>
      );
    }

    // Data row
    const row = pivot.rows[index - 1]; // because 0 is header
    return (
      <div className="flex w-max border-b border-gray-300" style={{ ...style, width: totalWidth }}>
        <div style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
          {row.rowKey}
        </div>
        {row.values.map((val, i) => (
          <div key={i} style={{ width: COLUMN_WIDTH, padding: '4px' }} className="overflow-hidden whitespace-nowrap text-ellipsis border">
            {val}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-4 border rounded shadow-sm overflow-x-auto">
      <List
        height={400}
        width={600}
        itemCount={pivot.rows.length + 1} // +1 for header
        itemSize={30}
        itemData={{ headers: [groupBy, ...pivot.columns], rows: pivot.rows, scrollRef }}
      >
        {Row}
      </List>
    </div>
  );
};

export default PivotTable;



// import { useMemo } from 'react';

// const PivotTable = ({ data, groupBy, columnField, sumColumn }) => {
//   const pivot = useMemo(() => {
//     const rowMap = new Map(); // { rowKey -> { colKey -> sum } }
//     // console.log("rowMap =",rowMap);
    
//     const columnSet = new Set(); //to get unique values to put as columns
//     // console.log("columnSet =",columnSet);
// //     rowMap:
// // {
// //   "India":     { tea: 10, rice: 40 },
// //   "America":   { tea: 5 },
// //   "China":     { tea: 30 },
// //   "Korea":     { rice: 20 },
// //   "Singapore": { fish: 10 }
// // }

// // columnSet: { "tea", "rice", "fish" }


//     data.forEach(row => {
//       const rowKey = row[groupBy]; //gives the value of key in that row => const rowKey = row["Region"]; => in row = { Region: "India", Product: "tea", Intake: "10" } => we get India
//       const colKey = row[columnField];
//       const value = parseFloat(row[sumColumn]) || 0;

//       columnSet.add(colKey);

//       if (!rowMap.has(rowKey)) rowMap.set(rowKey, {});
//       const rowData = rowMap.get(rowKey);
//       rowData[colKey] = (rowData[colKey] || 0) + value;
//     });

//     const columns = Array.from(columnSet);
//     const rows = Array.from(rowMap.entries()).map(([rowKey, colValues]) => ({
//       rowKey,
//       values: columns.map(col => colValues[col] || 0)
//     }));
// console.log("columns", columns);
// console.log("rows", rows);
// // columns = //products
// // ["tea", "rice", "fish"]
// // rows = 
// // 0: {rowKey: 'India', values: Array(1)}
// // 1: {rowKey: 'America', values: Array(1)}
// // 2: {rowKey: 'China', values: Array(1)}
// // 3: {rowKey: 'Korea', values: Array(1)}
// // 4: {rowKey: 'Singapore', values: Array(1)}


//     return { columns, rows };
//   }, [data, groupBy, columnField, sumColumn]);

//   return (
//     <div className="mt-4 border rounded shadow-sm overflow-x-auto">
//       <table className="min-w-full table-auto border-collapse">
//         <thead className="bg-purple-100">
//           <tr>
//             <th className="border px-4 py-2 text-left">{groupBy}</th>
//             {pivot.columns.map((col, idx) => (
//               <th key={idx} className="border px-4 py-2 text-left">{col}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {pivot.rows.map((row, idx) => (
//             <tr key={idx} className="border-t">
//               <td className="border px-4 py-2">{row.rowKey}</td>
//               {row.values.map((val, i) => (
//                 <td key={i} className="border px-4 py-2 ">{val}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PivotTable;
