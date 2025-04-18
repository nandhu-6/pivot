import React, { useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

const COLUMN_WIDTH = 120;

const Row = ({ index, style, data }) => {
  const { headers, rows} = data;
  const totalWidth = headers.length * COLUMN_WIDTH;

  if (index === 0) {
    // Header Row
    return (
      <div
        // ref={scrollRef}
        className="flex bg-purple-200 font-bold w-max"
        style={{ ...style, width: totalWidth }}
      >
        {headers.map((header, idx) => (
          <div
            key={idx}
            style={{ width: COLUMN_WIDTH, padding: '4px' }}
            className="overflow-hidden whitespace-nowrap text-ellipsis border text-center"
          >
            {header}
          </div>
        ))}
      </div>
    );
  }

  const row = rows[index - 1];

  return (
    <div
      className={`flex w-max border-0 border-gray-300 ${index %2 === 0 ? `bg-purple-100` : ""}`}
      style={{ ...style, width: totalWidth }}
    >
      {headers.map((header, idx) => (
        <div
          key={idx}
          style={{ width: COLUMN_WIDTH, padding: '4px' }}
          className="overflow-hidden whitespace-nowrap text-ellipsis border"
        >
          {row[header] ?? ''}
        </div>
      ))}
    </div>
  );
};

const TableComponent = ({ headers, data }) => {
  const scrollRef = useRef(null);

  const totalWidth = headers.length * COLUMN_WIDTH;

  return (
    <div style={{ width: 600,}} className=" rounded-md">
      <List
        height={480}
        width={600}
        itemCount={data.length + 1}
        itemSize={30}
        itemData={{ headers, rows: data, scrollRef }}
      >
        {Row}
      </List>
    </div>
  );
};

export default TableComponent;
