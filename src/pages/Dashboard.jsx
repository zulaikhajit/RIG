import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import TypeSelector from "../components/TypeSelector";
import ReportPanel from "../components/ReportPanel";

function Dashboard() {
  const [selectedType, setSelectedType] = useState("X-Ray");
  const [selectedFile, setSelectedFile] = useState(null);
  const [report, setReport] = useState(null);

  // Mock function to simulate backend analysis (replace with your real API call)
  const handleAnalyze = () => {
    if (selectedFile && selectedType) {
      setReport({
        diagnosis: "No abnormality detected",
        confidence: "98%",
        additionalInfo: ["Sample size: good", "Artifact: none"],
      });
    }
  };

  return (
    <div>
      <h2>Radiology Image Analysis</h2>
      <TypeSelector
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />
      <ImageUploader onFileSelect={setSelectedFile} />
      <button onClick={handleAnalyze} disabled={!selectedFile}>
        Analyze Image
      </button>
      <ReportPanel report={report} />
    </div>
  );
}

export default Dashboard;
