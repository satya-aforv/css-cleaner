import React, { useState } from "react";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

function CsvCleaner() {
  const [cleanedData, setCleanedData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rows = results.data;

        const cleaned = rows
          .map((row) => {
            const latitude = parseFloat(
              row["\uFEFFLatitude"] || row["Latitude"]
            );
            const longitude = parseFloat(row["Longitude"]);
            return { Latitude: latitude, Longitude: longitude };
          })
          .filter(
            (coord) =>
              !isNaN(coord.Latitude) &&
              !isNaN(coord.Longitude) &&
              coord.Latitude >= -90 &&
              coord.Latitude <= 90 &&
              coord.Longitude >= -180 &&
              coord.Longitude <= 180
          );

        setCleanedData(cleaned);
      },
    });
  };

  const downloadCSV = () => {
    if (!cleanedData) return;

    const header = "Latitude,Longitude\n";
    const rows = cleanedData
      .map((d) => `${d.Latitude},${d.Longitude}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "cleaned_" + fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: "2rem",
      }}
    >
      <div
        className="bg-white rounded-4 shadow p-4"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <h2 className="text-center mb-4 text-primary fw-bold">
          CSV GPS Cleaner
        </h2>

        <div className="mb-3">
          <label htmlFor="csvFile" className="form-label">
            Upload your CSV File
          </label>
          <input
            type="file"
            className="form-control"
            id="csvFile"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>

        <div className="d-grid gap-2">
          <button
            className="btn btn-success"
            onClick={downloadCSV}
            disabled={!cleanedData}
          >
            Download Cleaned CSV
          </button>
        </div>

        {cleanedData && (
          <div className="mt-4">
            <h5 className="text-secondary">Preview (First 5 Rows):</h5>
            <table className="table table-striped table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {cleanedData.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    <td>{row.Latitude}</td>
                    <td>{row.Longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvCleaner;
