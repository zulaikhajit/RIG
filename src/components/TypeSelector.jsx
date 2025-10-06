import React from "react";

function TypeSelector({ selectedType, onTypeChange }) {
  const types = ["X-Ray", "CT Scan", "MRI"];

  return (
    <div>
      <label>Select Image Type:</label>
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TypeSelector;
