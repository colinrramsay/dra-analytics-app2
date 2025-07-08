/* ======================
Helper Functions Library
====================== */

// Remove file extension from a file name
export function removeFileExtension(fileName) {
    const end = fileName.indexOf('.')
    return fileName.slice(0, end)
}

// Validate JSON structure
export function validateJson(file, type) {
  // Validation for 'single' type
  if (type === 'single') {
    // Check if file obj has statewide property that is a number
    if (!file.statewide || typeof file.statewide !== 'number') {
      return false;
    }
    // Check if file obj has byDistrict property that is an array
    if (!file.byDistrict || !Array.isArray(file.byDistrict)) {
      return false;
    }
    return true; // Return true if all checks pass
  } else if (type === 'volume') {
    return true; // Placeholder for volume type validation
  } else {
    return true; // Default case, return true if type is not recognized
  }
}