import { ref, onMounted } from 'vue';
import { fetchComplexities, fetchLanguages, fetchApiStatus } from '../services/campaignApi.js';

const DEFAULT_COMPLEXITIES = [
  {
    id: 'simple',
    backendId: 'simples',
    name: 'Simple Campaign',
    sessions: '1-2 sessions',
    description: 'Straightforward story, perfect for oneshots',
    duration: '3-8 hours',
    focus: 'Combat and clear objectives',
  },
  {
    id: 'medium',
    backendId: 'mediana',
    name: 'Medium Campaign',
    sessions: '3-4 sessions',
    description: 'Balance between combat, exploration, and development',
    duration: '9-16 hours',
    focus: 'Story with branching paths',
  },
  {
    id: 'complex',
    backendId: 'complexa',
    name: 'Complex Campaign',
    sessions: '5+ sessions',
    description: 'Epic arc with multiple paths and consequences',
    duration: '17+ hours',
    focus: 'Deep narrative and character development',
  },
];

export function useMetadata() {
  const complexities = ref([...DEFAULT_COMPLEXITIES]);
  const languages = ref([]);
  const apiStatus = ref(null);
  const selectedLanguage = ref('en');
  const selectedComplexity = ref('medium');

  function mapComplexitiesFromBackend(data) {
    if (!data || typeof data !== 'object') return;
    complexities.value = Object.entries(data).map(([backendId, info]) => ({
      id: backendId === 'simples' ? 'simple' : backendId === 'mediana' ? 'medium' : 'complex',
      backendId,
      name: info.name || backendId,
      sessions: info.sessions || '',
      description: info.description || '',
      duration: info.duration || '',
      focus: info.focus || '',
    }));
  }

  function mapLanguagesFromBackend(data) {
    if (!data || typeof data !== 'object') return;
    languages.value = Object.entries(data).map(([code, name]) => ({
      code,
      name,
      backendCode: code,
    }));
  }

  function getComplexityInfo(complexityId) {
    return complexities.value.find((c) => c.id === complexityId) || complexities.value[1];
  }

  function getLanguageName(code) {
    return languages.value.find((l) => l.code === code)?.name || code;
  }

  async function loadMetadata() {
    try {
      const [complexityData, languageData, statusData] = await Promise.all([
        fetchComplexities().catch(() => null),
        fetchLanguages().catch(() => null),
        fetchApiStatus().catch(() => null),
      ]);
      mapComplexitiesFromBackend(complexityData);
      mapLanguagesFromBackend(languageData);
      apiStatus.value = statusData;
    } catch {
      /* use defaults below */
    }

    if (languages.value.length === 0) {
      languages.value = [
        { code: 'pt', name: 'Portuguese', backendCode: 'pt' },
        { code: 'en', name: 'English', backendCode: 'en' },
        { code: 'es', name: 'Spanish', backendCode: 'es' },
        { code: 'fr', name: 'French', backendCode: 'fr' },
        { code: 'de', name: 'German', backendCode: 'de' },
        { code: 'it', name: 'Italian', backendCode: 'it' },
        { code: 'ja', name: 'Japanese', backendCode: 'ja' },
        { code: 'ko', name: 'Korean', backendCode: 'ko' },
        { code: 'zh', name: 'Chinese', backendCode: 'zh' },
        { code: 'ru', name: 'Russian', backendCode: 'ru' },
      ];
    }
  }

  onMounted(loadMetadata);

  return {
    complexities,
    languages,
    apiStatus,
    selectedLanguage,
    selectedComplexity,
    getComplexityInfo,
    getLanguageName,
    loadMetadata,
  };
}
