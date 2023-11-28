import { useState } from "react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const App = () => {

  const [fileData, setFileData] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [excelData, setExcelData] = useState(null);

  const handleFile = (e) => {
    let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    let selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);

        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);

        reader.onload = (e) => {
          setFileData({
            data: e.target.result,
            type: selectedFile.type,
          });
        };
      } else {
        setTypeError('Please select only Excel or CSV file types');
        setFileData(null);
      }
    } else {
      console.log('Please select your file');
    }
  }

  const handleFileSubmit = (e) => {
    e.preventDefault();

    if (fileData !== null) {
      if (fileData.type === 'text/csv') {
        const text = new TextDecoder().decode(fileData.data);

        Papa.parse(text, {
          complete: (result) => {
            setExcelData(result.data.slice(0, 10));
          },
          header: true,
        });
      } else {
        const workbook = XLSX.read(fileData.data, { type: 'buffer' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data.slice(0, 10));
      }
    }
  }

  return (
    <div className="wrapper">
      <h3>Upload & View Excel or CSV Sheets</h3>

      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        <input type="file" className="form-control" required onChange={handleFile} />
        <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
        {typeError && (
          <div className="alert alert-danger" role="alert">{typeError}</div>
        )}
      </form>

      <div className="viewer">
        {excelData ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key) => (
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No File is uploaded yet!</div>
        )}
      </div>
    </div>
  );
}