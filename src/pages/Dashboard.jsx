import React, { useState } from "react";
import { Upload, Activity, FileImage, AlertCircle } from "lucide-react";
import { analyzeXRay, segmentCT, segmentMRI } from "../services/api";
// Mock Components (replace with your actual components)
const ImageUploader = ({ onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 mb-3 text-blue-500" />
            <p className="mb-2 text-sm text-gray-700 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, DICOM (MAX. 10MB)</p>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
      </label>
    </div>
  );
};

const TypeSelector = ({ selectedType, onTypeChange }) => {
  const types = ["X-Ray", "CT Scan", "MRI", "Ultrasound"];

  return (
    <div className="flex flex-wrap gap-3">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            selectedType === type
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

const ReportPanel = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-800">Analysis Report</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium mb-1">Diagnosis</p>
          <p className="text-lg font-semibold text-green-900">
            {report.diagnosis}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-1">
            Confidence Level
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {report.confidence}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Additional Information
          </p>
          <ul className="space-y-1">
            {report.additionalInfo.map((info, idx) => (
              <li key={idx} className="text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                {info}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [selectedType, setSelectedType] = useState("X-Ray");
  const [selectedFile, setSelectedFile] = useState(null);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (selectedFile && selectedType) {
      setIsAnalyzing(true);
      setError(null);
      setReport(null);

      try {
        let response;
        if (selectedType === "MRI") {
          response = await segmentMRI(selectedFile);
        } else if (selectedType === "CT Scan") {
          response = await segmentCT(selectedFile);
        } else {
          // Defaults to X-Ray
          response = await analyzeXRay(selectedFile);
        }

        // Transform API response to match expected format
        const report = {
          diagnosis:
            response.diagnosis || response.result || "Analysis complete",
          confidence: response.confidence || response.probability || "95%",
          additionalInfo: response.insights ||
            response.conditions ||
            response.findings || ["Analysis completed successfully"],
        };

        setReport(report);
      } catch (error) {
        console.error("API Error:", error);
        let errorMessage = error.message;

        // Handle network errors
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage =
            "Unable to connect to analysis server. Please check if the backend services are running.";
        }

        setError(errorMessage);
        setReport({
          diagnosis: "Analysis failed",
          confidence: "0%",
          additionalInfo: [`Error: ${errorMessage}`],
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Input */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Select Imaging Type
          </h3>
          <TypeSelector
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Medical Image
          </h3>
          <ImageUploader onFileSelect={setSelectedFile} />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            !selectedFile || isAnalyzing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Analyzing...</span>
            </span>
          ) : (
            <span className="text-white">Analyze Image</span>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-red-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800">API Error</p>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Right Panel - Results */}
      <div>
        {report ? (
          <ReportPanel report={report} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300">
            <Activity className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              Upload an image and click analyze to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
