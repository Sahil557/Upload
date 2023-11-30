import { useState } from "react";
import * as XLSX from 'xlsx';

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

        if (selectedFile.type === 'text/csv') {
          reader.readAsText(selectedFile);
        } else {
          reader.readAsArrayBuffer(selectedFile);
        }

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
      const workbook = XLSX.read(fileData.data, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length > 0 && 'tenant_stack' in data[0] && 'data_source_system' in data[0] && 'layer_name' in data[0]) {
        const validTenantStackValues = ['eu_s3', 'eu_sf', 'us_s3', 'us_sf', 'cn_s3', 'cn_rs'];
        const validDataSourceValues = ['aa', 'ab', 'ac', 'ad', 'ae', 'af'];
        const validLayerNameValues = ['ab'];

        const isValidFile = data.every((row) =>
          validTenantStackValues.includes(row['tenant_stack']) &&
          validDataSourceValues.includes(row['data_source_system']) &&
          validLayerNameValues.includes(row['layer_name'])
        );

        if (isValidFile) {
          setExcelData(data.slice(0, 10));
          setTypeError(null);
        } else {
          setTypeError('File upload failed. Some values in the tenant_stack or data_source_system columns do not match the valid values.');
        }
      } else {
        setTypeError('The tenant_stack or data_source_system column is missing in the uploaded file. Please upload a valid file.');
      }
    }
  };

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
