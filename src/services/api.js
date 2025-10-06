// MRI Segmentation API
export async function segmentMRI(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://13.126.43.3:5002/segment_mri", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
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
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// X-Ray Analysis API
export async function analyzeXRay(file) {
  const formData = new FormData();
  formData.append("file", file);

  const url = new URL("http://13.126.43.3:5000/");
  url.searchParams.append("analyze", "null");

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json(); // JSON object with condition probability keys
}
