import{ useState } from 'react';
import FileUploader from './Components/FileUploader';
import ConfigForm from './Components/ConfigForm';
import PivotTable from './Components/PivotTable';
import TableComponent from './Components/TableComponent';

function App() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState(null);
  // console.log("header:", headers);
  // console.log("data:", data);
  

  // console.log("config = ", config);
  

  return (
    <div className="max-w-7xl mx-auto p-6 flex justify-between space-x-2">

      <div className='flex-1'>
      <FileUploader onParsed={(h, d) => { setHeaders(h); setData(d); }} />
      <TableComponent headers={headers} data={data}></TableComponent>
      </div>

      <div className='flex-1'>
      {headers.length > 0 && (
        <ConfigForm headers={headers} onConfigChange={setConfig} />
      )}

      {config && (
  <PivotTable
    data={data}
    groupBy={config.groupBy}
    columnField={config.columnField}
    sumColumn={config.sumColumn}
  />
)}
      </div>
        
      

      

    </div>
  );
}

export default App;


// import{ useState } from 'react';
// import FileUploader from './Components/FileUploader';
// import ConfigForm from './Components/ConfigForm';
// import PivotTable from './Components/PivotTable';

// function App() {
//   const [headers, setHeaders] = useState([]);
//   const [data, setData] = useState([]);
//   const [config, setConfig] = useState(null);

//   // console.log("config = ", config);
  

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <FileUploader onParsed={(h, d) => { setHeaders(h); setData(d); }} />
        
//       {headers.length > 0 && (
//         <ConfigForm headers={headers} onConfigChange={setConfig} />
//       )}
//       {config && (
//   <PivotTable
//     data={data}
//     groupBy={config.groupBy}
//     columnField={config.columnField}
//     sumColumn={config.sumColumn}
//   />
// )}

//     </div>
//   );
// }

// export default App;
