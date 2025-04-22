import React from "react";
import * as XLSX from "xlsx";

const FileUploader = ({ onParsed }) => {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let workbook;

      if (fileExt === 'csv') {
        const text = event.target.result;
        workbook = XLSX.read(text, { type: 'string' });
      } else {
        const data = new Uint8Array(event.target.result);
        workbook = XLSX.read(data, { type: 'array' });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const [headerRow, ...dataRows] = jsonData;
      if (!headerRow || headerRow.length === 0) return;

      // ✨ Identify probable date columns (based on header name)
      const dateKeywords = ["date", "dob", "joining", "issued", "birth"];
      const dateColumns = headerRow
        .map((header, idx) => ({
          index: idx,
          name: header?.toLowerCase?.() || "",
        }))
        .filter(({ name }) => dateKeywords.some((keyword) => name.includes(keyword)))
        .map(({ index }) => index);

      // ✨ Format the data properly
      const formattedData = dataRows.map((row) => {
        const obj = {};
        headerRow.forEach((header, index) => {
          const value = row[index];

          // ✨ If it is a date column and value is a number, convert it to date
          if (dateColumns.includes(index) && typeof value === "number") {
            const date = XLSX.SSF.parse_date_code(value);
            if (date) {
              const jsDate = new Date(date.y, date.m - 1, date.d);
              obj[header?.trim?.()] = jsDate.toISOString().split("T")[0]; // yyyy-mm-dd format
            } else {
              obj[header?.trim?.()] = value;
            }
          } else {
            // Otherwise keep original
            const parsedVal =
              typeof value === 'string' && !isNaN(value) && value.trim() !== ''
                ? parseFloat(value)
                : value;
            obj[header?.trim?.()] = parsedVal;
          }
        });
        return obj;
      });

      const headers = headerRow.map((h) => h?.trim?.());
      onParsed(headers, formattedData);
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleUpload}
        className="file:px-4 file:py-2 file:rounded file:bg-purple-400 file:text-white file:font-bold hover:file:bg-purple-100 hover:file:text-purple-600 hover:cursor-pointer"
      />
    </div>
  );
};

export default FileUploader;

