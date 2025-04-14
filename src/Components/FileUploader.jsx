import React from 'react';
import * as XLSX from 'xlsx';

const FileUploader = ({ onParsed }) => {

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let workbook;

      if (fileExt === 'csv') {
        const text = event.target.result; //plain text
        // console.log("text = ",text);
        workbook = XLSX.read(text, { type: 'string' }); 
        // console.log("workbook =",workbook);
        
      } else {
        const data = new Uint8Array(event.target.result);
        // console.log("data : ",data);
        workbook = XLSX.read(data, { type: 'array' });
        // console.log("workbook : ", workbook);
        
      }

      const sheetName = workbook.SheetNames[0];
    //   console.log("sheetname : ",sheetName);
      const worksheet = workbook.Sheets[sheetName];
    //   console.log("worksheet :", worksheet); //which cell has what value
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //   console.log("jsonData :" ,jsonData); //whole data in the form of rows
      

      const [headerRow, ...dataRows] = jsonData;
      
      if (!headerRow || headerRow.length === 0) return;

      //convert each row into an obj
      const formattedData = dataRows.map(row => {
        const obj = {};
        headerRow.forEach((header, index) => {
          const value = row[index];
          const parsedVal =
            typeof value === 'string' && !isNaN(value) && value.trim() !== ''
              ? parseFloat(value)
              : value;
          obj[header?.trim?.()] = parsedVal;
        });
        return obj;
      });

      const headers = headerRow.map(h => h?.trim?.());
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
