interface UrlBuilderConfig {
  baseUrl?: string;
  extension?: string;
}

export const buildActionUrl = (
  module: string,
  controller: string,
  action: string,
  config: UrlBuilderConfig = {},
): string => {
  const { baseUrl = '', extension = '.action' } = config;
  return `${baseUrl}/${module}/${controller}/${action}${extension}`;
};

// Add a new function for OpenMRS-specific URLs
export const buildOpenMRSActionUrl = (
  module: string,
  controller: string,
  action: string,
  includeSuccessUrl: boolean = false,
): string => {
  const baseUrl = `/openmrs/${module}/${controller}/${action}.action`;

  if (includeSuccessUrl) {
    const successUrl = encodeURIComponent('/openmrs/nigeriaemr/customNdr.page?');
    return `${baseUrl}?successUrl=${successUrl}`;
  }

  return baseUrl;
};
