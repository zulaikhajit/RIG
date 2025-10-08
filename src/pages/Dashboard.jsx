import React, { useState } from "react";
import { Upload, Activity, AlertCircle } from "lucide-react";
import { analyzeXRay, segmentCT, segmentMRI } from "../services/api";
import ImageUploader from "../components/ImageUploader";

const TypeSelector = ({ selectedType, onTypeChange }) => {
  const types = ["X-Ray", "CT Scan", "MRI"];

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

  // Extract lesion percentage for CT scans
  const lesionPercentage = report.confidence.includes("% lesion coverage")
    ? parseFloat(report.confidence.replace("% lesion coverage", ""))
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Medical Disclaimer Warning */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              Medical Disclaimer
            </h4>
            <p className="text-sm text-yellow-700">
              This AI analysis is for informational purposes only and should not
              be used for medical diagnosis or treatment decisions. Always
              consult with a qualified healthcare professional for proper
              medical evaluation and diagnosis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-800">Analysis Report</h3>
      </div>

      {/* Status Summary */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Analysis Complete -{" "}
            {report.diagnosis.includes("No abnormality")
              ? "Normal Findings"
              : "Findings Detected"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium mb-1">
            Primary Diagnosis
          </p>
          <p className="text-lg font-semibold text-green-900">
            {report.diagnosis}
          </p>
        </div>

        {lesionPercentage > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium mb-2">
              Lesion Coverage Analysis
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-orange-100 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(lesionPercentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-orange-900 min-w-[3rem]">
                {lesionPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {lesionPercentage > 50
                ? "Significant lesion coverage detected"
                : "Moderate lesion coverage"}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-1">
            {lesionPercentage > 0 ? "Coverage Details" : "Confidence Level"}
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {report.confidence}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Detailed Medical Report
          </p>
          <ul className="space-y-2">
            {Array.isArray(report.additionalInfo) &&
              report.additionalInfo.map((info, idx) => (
                <li key={idx} className="text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">{info}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                Insights
              </h4>
              <p className="text-sm text-yellow-700">{report.insights}</p>
            </div>
          </div>
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
  const [resetKey, setResetKey] = useState(0);

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setSelectedFile(null);
    setReport(null);
    setError(null);
    setResetKey((prev) => prev + 1); // Trigger reset for ImageUploader
  };

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
        let report;

        if (selectedType === "CT Scan") {
          // Handle CT Scan specific response format
          report = {
            diagnosis: response.report
              ? response.report[0]
              : "CT Analysis complete",
            confidence: `${response.lesion_percentage || 0}% lesion coverage`,
            insights: response.insights || "No insights available",
            additionalInfo: [
              `Lesion Coverage: ${response.lesion_percentage || 0}%`,
              `Lesion Voxels: ${response.lesion_voxels || 0}`,
              ...(Array.isArray(response.report)
                ? response.report.slice(1)
                : []),
            ],
          };
        } else if (selectedType === "MRI") {
          // Handle MRI specific response format
          report = {
            diagnosis:
              response.diagnosis || response.result || "MRI Analysis complete",
            confidence: response.confidence || response.probability || "95%",
            insights: response.insights || "No additional insights available",
            additionalInfo: Array.isArray(response.insights)
              ? response.insights
              : Array.isArray(response.conditions)
              ? response.conditions
              : Array.isArray(response.findings)
              ? response.findings
              : ["MRI Analysis completed successfully"],
          };
        } else {
          // Handle X-Ray specific response format (condition probabilities)
          const conditions = response;
          const topCondition = Object.entries(conditions)
            .filter(([key]) => key !== "detector_used" && key !== "insights")
            .reduce((a, b) => (conditions[a[0]] > conditions[b[0]] ? a : b));

          report = {
            diagnosis: `${topCondition[0].replace(
              /_/g,
              " "
            )} - Primary Finding`,
            confidence: `${(topCondition[1] * 100).toFixed(1)}% confidence`,
            insights: response.insights || "No additional insights available",
            additionalInfo: Object.entries(conditions)
              .filter(
                ([key, prob]) =>
                  key !== "detector_used" && key !== "insights" && prob > 0.01
              )
              .sort(([, a], [, b]) => b - a)
              .map(([condition, probability]) => {
                const cleanCondition = condition.replace(/_/g, " ");
                const percentage = (probability * 100).toFixed(1);
                return `${cleanCondition}: ${percentage}%`;
              }),
          };
        }

        setReport(report);
      } catch (error) {
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
            onTypeChange={handleTypeChange}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Medical Image
          </h3>
          <ImageUploader onFileSelect={setSelectedFile} reset={resetKey} />
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
