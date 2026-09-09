import axios from 'axios';
import { getAuthHeaders } from '../composables/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

client.interceptors.request.use(async (config) => {
  const headers = await getAuthHeaders();
  Object.assign(config.headers, headers);
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      const { openSignIn, isDevAuth } = await import('../composables/useAuth.js');
      if (!isDevAuth) {
        await openSignIn();
      }
    }
    return Promise.reject(error);
  },
);

export const COMPLEXITY_MAP = {
  simple: 'simples',
  medium: 'mediana',
  complex: 'complexa',
};

export const BACKEND_TO_FRONTEND_COMPLEXITY = {
  simples: 'simple',
  mediana: 'medium',
  complexa: 'complex',
};

export async function fetchApiStatus() {
  const { data } = await client.get('/status');
  return data;
}

export async function fetchComplexities() {
  const { data } = await client.get('/campaign-complexities');
  return data;
}

export async function fetchLanguages() {
  const { data } = await client.get('/supported-languages');
  return data;
}

export async function fetchSystemPresets() {
  const { data } = await client.get('/system-presets');
  return data;
}

export async function fetchMe() {
  const { data } = await client.get('/dashboard/me');
  return data;
}

export async function fetchDashboardJobs() {
  const { data } = await client.get('/dashboard/jobs');
  return data.jobs;
}

export async function generateCampaign(formData, idempotencyKey) {
  const headers = { 'Content-Type': 'multipart/form-data' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const { data, status } = await client.post('/generate-campaign', formData, { headers });
  return { data, status };
}

export async function fetchJobStatus(jobId) {
  const { data } = await client.get(`/job-status/${jobId}`);
  return data;
}

export async function refreshCampaignUrl(jobId) {
  const { data } = await client.post(`/job-status/${jobId}/refresh-url`);
  return data;
}

export async function refreshDashboardJobUrl(jobId) {
  const { data } = await client.post(`/dashboard/jobs/${jobId}/refresh-url`);
  return data;
}

export async function createShareLink(jobId) {
  const { data } = await client.post(`/dashboard/jobs/${jobId}/share`);
  return data;
}

export async function exportJobPdf(jobId) {
  const response = await client.get(`/dashboard/jobs/${jobId}/export/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function exportJobMarkdown(jobId) {
  const response = await client.get(`/dashboard/jobs/${jobId}/export/markdown`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function fetchJobContent(jobId) {
  const { data } = await client.get(`/dashboard/jobs/${jobId}/content`);
  return data;
}

export async function generateApiKey() {
  const { data } = await client.post('/dashboard/api-key');
  return data;
}

export async function regenerateSection(jobId, section, instructions) {
  const { data } = await client.post(`/dashboard/jobs/${jobId}/regenerate-section`, {
    section,
    instructions,
  });
  return data;
}

export async function fetchDetectSystem(formData) {
  const { data } = await client.post('/detect-system', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchExampleCampaign(complexity, language) {
  const { data } = await client.get('/example-campaign', {
    params: { complexity, language },
  });
  return data;
}

export async function fetchSharedCampaign(slug) {
  const { data } = await client.get(`/c/${slug}`);
  return data;
}

export async function fetchContentLicense() {
  const { data } = await client.get('/legal/content-license');
  return data.license;
}

export async function fetchCampaignContent(campaignUrl) {
  const { data } = await axios.get(campaignUrl, { responseType: 'text' });
  return data;
}

export { API_URL };
