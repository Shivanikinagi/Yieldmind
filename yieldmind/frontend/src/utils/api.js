const CONFIGURED_API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3011';

function getApiCandidates() {
  const candidates = [CONFIGURED_API_BASE];

  if (typeof window !== 'undefined') {
    candidates.push(window.location.origin.replace(/\/$/, ''));
  }

  return [...new Set(candidates.filter(Boolean))];
}

export async function readJsonResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error(`Invalid JSON response from ${response.url || 'API'} (${response.status})`);
  }
}

export async function fetchApiJson(path, options) {
  const errors = [];

  for (const baseUrl of getApiCandidates()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      const data = await readJsonResponse(response);

      return { response, data, baseUrl };
    } catch (error) {
      errors.push({ baseUrl, error });
    }
  }

  const configuredApiError = errors.find((item) => item.baseUrl === CONFIGURED_API_BASE)?.error;

  if (configuredApiError) {
    throw new Error(`Backend API not available at ${CONFIGURED_API_BASE}. Start the backend server and retry.`);
  }

  throw errors[errors.length - 1]?.error || new Error(`Unable to reach API for ${path}`);
}
