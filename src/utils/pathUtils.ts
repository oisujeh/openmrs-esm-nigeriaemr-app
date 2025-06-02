export const convertToDownloadUrl = (filePath: string): string => {
  if (!filePath) return '';

  // Manually extract the parts we need
  const filename = filePath.split('\\').pop(); // Get the last part (filename)

  // Build the URL manually
  return `${window.location.origin}/openmrs/downloads/NDR/${filename}`;
};
