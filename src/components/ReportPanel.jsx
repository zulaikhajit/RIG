import React from "react";

function ReportPanel({ report }) {
  if (!report) {
    return <div>No inference results yet.</div>;
  }

  return (
    <div>
      <h3>Inference Results</h3>
      <p>
        <strong>Diagnosis:</strong> {report.diagnosis}
      </p>
      <p>
        <strong>Confidence:</strong> {report.confidence}
      </p>
      {report.additionalInfo && (
        <div>
          <h4>Additional Findings:</h4>
          <ul>
            {report.additionalInfo.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReportPanel;
