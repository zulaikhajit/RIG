// MRI Segmentation API
export async function segmentMRI(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://13.126.43.3:5002/segment_mri", {
    method: "POST",

    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `MRI API error: ${response.status} - ${response.statusText}`
    );
  }

  // Response format: { insights: [...], segmentation_file: "..." }
  return response.json();
}

// CT Scan API
export async function segmentCT(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://13.126.43.3:5001/segment", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `CT API error: ${response.status} - ${response.statusText}`
    );
  }

  return response.json();
}

// X-Ray Analysis API
export async function analyzeXRay(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://13.126.43.3:5000/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `X-Ray API error: ${response.status} - ${response.statusText}`
    );
  }

  return response.json(); // JSON object with condition probability keys
}
