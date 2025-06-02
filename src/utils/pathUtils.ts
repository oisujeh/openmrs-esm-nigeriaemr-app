export const convertToDownloadUrl = (filePath: string): string => {
  if (!filePath) return '';
  const normalizedPath = filePath.replace(/\\/g, '/');
  const filename = normalizedPath.split('/').pop();
  if (!filename) return '';
  const encodedFilename = encodeURIComponent(filename);
  return `${window.location.origin}/openmrs/downloads/NDR/${encodedFilename}`;
};
