<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
    <!-- Header -->
    <header class="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-b border-purple-500">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-xl font-bold">🎲</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                RPG Campaign Generator
              </h1>
              <p class="text-gray-300 text-sm">Transforme livros de RPG em campanhas prontas para jogar</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Upload Section -->
      <div class="max-w-6xl mx-auto">
        <div
          class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500 border-opacity-30 shadow-2xl">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-4">Criar Nova Campanha</h2>
            <p class="text-gray-300 text-lg">
              Envie um livro de RPG e receba uma campanha completa e pronta para jogar
            </p>
          </div>

          <!-- Configuration Options -->
          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <!-- Language Selection -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300">
                🌍 Idioma da Campanha
              </label>
              <select v-model="selectedLanguage"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                  {{ lang.name }}
                </option>
              </select>
            </div>

            <!-- Complexity Selection -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300">
                ⚡ Complexidade
              </label>
              <select v-model="selectedComplexity"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option v-for="complexity in complexities" :key="complexity.id" :value="complexity.id">
                  {{ complexity.name }} - {{ complexity.sessions }}
                </option>
              </select>
            </div>
          </div>

          <!-- Complexity Info -->
          <div v-if="selectedComplexity" class="mb-8 p-4 bg-gray-700 rounded-lg border-l-4 border-purple-500">
            <h3 class="font-semibold mb-2">{{ getComplexityInfo(selectedComplexity).name }}</h3>
            <p class="text-sm text-gray-300">{{ getComplexityInfo(selectedComplexity).description }}</p>
            <div class="mt-2 text-xs text-purple-300">
              <span>⏱️ {{ getComplexityInfo(selectedComplexity).duration }}</span>
              <span class="mx-2">•</span>
              <span>🎯 {{ getComplexityInfo(selectedComplexity).focus }}</span>
            </div>
          </div>

          <!-- Upload Area -->
          <div @click="selectFile" @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave" :class="[
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
            dragOver ? 'border-purple-400 bg-purple-900 bg-opacity-20' : 'border-gray-600 hover:border-purple-500 hover:bg-gray-700'
          ]">
            <div class="space-y-4">
              <div
                class="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span class="text-2xl">📚</span>
              </div>

              <div>
                <h3 class="text-xl font-semibold mb-2">
                  {{ selectedFile ? selectedFile.name : 'Selecione seu livro de RPG' }}
                </h3>
                <p class="text-gray-300">
                  Arraste um arquivo PDF ou clique para selecionar
                </p>
              </div>

              <div v-if="!selectedFile" class="text-sm text-gray-400">
                Formatos suportados: PDF (máx. 50MB)
              </div>

              <button v-if="selectedFile && !isLoading" @click.stop="clearFile"
                class="px-4 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-red-600 hover:bg-opacity-30 transition">
                Remover Arquivo
              </button>
            </div>
          </div>

          <!-- Upload Button -->
          <div class="text-center mt-8">
            <button @click="generateCampaign" :disabled="!selectedFile || isLoading || isPolling" :class="[
              'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform',
              selectedFile && !isLoading && !isPolling
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:scale-105'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            ]">
              <span v-if="!isLoading && !isPolling">🎲 Gerar Campanha</span>
              <span v-else class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                </svg>
                <span>{{ isPolling ? `Processando... ${pollingProgress}` : 'Enviando arquivo...' }}</span>
              </span>
            </button>
          </div>

          <!-- Hidden File Input -->
          <input type="file" ref="fileInput" @change="handleFileChange" accept=".pdf" class="hidden" />
        </div>

        <!-- Processing Status -->
        <div v-if="isPolling && jobId"
          class="mt-8 bg-blue-900 bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500">
          <div class="flex items-center space-x-4">
            <span class="text-3xl">⏳</span>
            <div class="flex-1">
              <h3 class="font-semibold text-blue-400 text-xl">Processando sua campanha...</h3>
              <p class="text-blue-300 mt-2">{{ pollingMessage }}</p>

              <!-- Progress Bar -->
              <div class="mt-4">
                <div class="flex justify-between text-sm text-blue-300 mb-2">
                  <span>{{ pollingProgress }}</span>
                  <span>Tempo decorrido: {{ formatTime(pollingElapsedTime) }}</span>
                </div>
                <div class="w-full bg-blue-900 bg-opacity-30 rounded-full h-2.5">
                  <div
                    class="bg-gradient-to-r from-blue-400 to-purple-400 h-2.5 rounded-full transition-all duration-300"
                    :style="{ width: pollingProgressPercentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="campaignResult && !isPolling"
          class="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 border border-green-500 border-opacity-30">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">🎯</span>
            </div>
            <h2 class="text-3xl font-bold text-green-400 mb-2">Campanha Gerada com Sucesso!</h2>
            <p class="text-gray-300 text-lg">Sua campanha está pronta para ser jogada</p>
          </div>

          <!-- Campaign Preview -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold flex items-center space-x-2">
                <span>📖</span>
                <span>Preview da Campanha</span>
              </h3>
              <button @click="togglePreview"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm">
                {{ showFullPreview ? 'Mostrar Menos' : 'Mostrar Mais' }}
              </button>
            </div>

            <div :class="[
              'bg-gray-900 rounded-xl p-6 overflow-hidden transition-all duration-500',
              showFullPreview ? 'max-h-none' : 'max-h-96'
            ]">
              <div class="prose prose-invert prose-lg max-w-none" v-html="formattedCampaign"></div>
            </div>
          </div>

          <!-- Campaign Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">🎭</div>
              <div class="text-sm text-gray-300">Complexidade</div>
              <div class="font-semibold capitalize">{{ selectedComplexity }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">🌍</div>
              <div class="text-sm text-gray-300">Idioma</div>
              <div class="font-semibold">{{ getLanguageName(selectedLanguage) }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">⏱️</div>
              <div class="text-sm text-gray-300">Duração</div>
              <div class="font-semibold">{{ getComplexityInfo(selectedComplexity).duration }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">📅</div>
              <div class="text-sm text-gray-300">Sessões</div>
              <div class="font-semibold">{{ getComplexityInfo(selectedComplexity).sessions }}</div>
            </div>
          </div>

          <!-- Download Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a :href="campaignResult.campaign_url" target="_blank"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition transform hover:scale-105 flex items-center justify-center space-x-3 text-center">
              <span>📥</span>
              <span>Download da Campanha</span>
            </a>

            <button @click="downloadFormattedPDF"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 flex items-center justify-center space-x-3">
              <span>🖨️</span>
              <span>Download PDF Formatado</span>
            </button>

            <button @click="generateNewCampaign"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105 flex items-center justify-center space-x-3">
              <span>🎲</span>
              <span>Nova Campanha</span>
            </button>
          </div>

          <!-- Job Info -->
          <div class="mt-6 text-center text-sm text-gray-400">
            <p class="mt-1">Tempo total de processamento: {{ formatTime(processingTime) }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage"
          class="mt-8 bg-red-900 bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-red-500">
          <div class="flex items-center space-x-4">
            <span class="text-3xl">❌</span>
            <div>
              <h3 class="font-semibold text-red-400 text-xl">Erro ao gerar campanha</h3>
              <p class="text-red-300 mt-2">{{ errorMessage }}</p>
              <button v-if="jobId" @click="retryPolling"
                class="mt-4 px-4 py-2 bg-red-700 rounded-lg hover:bg-red-600 transition text-sm">
                Tentar novamente
              </button>
            </div>
          </div>
        </div>

        <!-- Example Section -->
        <div class="mt-12 text-center">
          <button @click="loadExample" :disabled="isLoading || isPolling"
            class="px-8 py-4 bg-gray-700 bg-opacity-50 border-2 border-gray-600 rounded-xl hover:bg-gray-600 hover:border-gray-500 transition text-gray-300 text-lg font-semibold">
            🎯 Ver Exemplo de Campanha
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 bg-opacity-50 border-t border-gray-700 mt-16">
      <div class="container mx-auto px-4 py-8 text-center">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-400">RPG Campaign Generator - Transforme livros em aventuras épicas</p>
          <div class="flex space-x-4">
            <button @click="printCampaign" v-if="campaignResult && !isPolling"
              class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300">
              🖨️ Imprimir
            </button>
            <button @click="copyToClipboard" v-if="campaignResult && !isPolling"
              class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300">
              📋 Copiar
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';

export default {
  name: 'App',
  data() {
    return {
      selectedFile: null,
      selectedLanguage: 'pt',
      selectedComplexity: 'mediana',
      isLoading: false,
      isPolling: false,
      dragOver: false,
      campaignResult: null,
      campaignContent: '',
      errorMessage: '',
      showFullPreview: false,
      jobId: null,
      pollingInterval: null,
      pollingAttempts: 0,
      maxPollingAttempts: 300, // 5 minutos (300 * 1 segundo)
      pollingStartTime: null,
      pollingElapsedTime: 0,
      pollingProgress: '0%',
      pollingProgressPercentage: 0,
      pollingMessage: 'Aguardando processamento...',
      processingTime: 0,

      languages: [
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'it', name: 'Italiano' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'zh', name: '中文' },
        { code: 'ru', name: 'Русский' }
      ],

      complexities: [
        { id: 'simples', name: 'Campanha Simples', sessions: '1-2 sessões', description: 'História direta e objetiva, perfeita para oneshots', duration: '3-8 horas', focus: 'Combate e objetivos claros' },
        { id: 'mediana', name: 'Campanha Mediana', sessions: '3-4 sessões', description: 'Equilíbrio entre combate, exploração e desenvolvimento', duration: '9-16 horas', focus: 'História com ramificações' },
        { id: 'complexa', name: 'Campanha Complexa', sessions: '5+ sessões', description: 'Arco épico com múltiplos caminhos e consequências', duration: '17+ horas', focus: 'Narrativa profunda' }
      ]
    };
  },

  computed: {
    formattedCampaign() {
      if (!this.campaignContent) return '';

      // Configurar marked para renderização segura
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false
      });

      return marked(this.campaignContent);
    }
  },

  mounted() {
    this.fetchComplexities();
  },

  beforeUnmount() {
    this.stopPolling();
  },

  methods: {
    // File handling methods
    selectFile() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type === 'application/pdf') {
          this.selectedFile = file;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Por favor, selecione um arquivo PDF.';
        }
      }
    },

    handleDrop(event) {
      event.preventDefault();
      this.dragOver = false;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          this.selectedFile = file;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Por favor, solte um arquivo PDF.';
        }
      }
    },

    handleDragOver(event) {
      event.preventDefault();
      this.dragOver = true;
    },

    handleDragLeave() {
      this.dragOver = false;
    },

    clearFile() {
      this.selectedFile = null;
      this.$refs.fileInput.value = '';
    },

    // Campaign generation
    async generateCampaign() {
      if (!this.selectedFile) {
        this.errorMessage = 'Por favor, selecione um arquivo PDF.';
        return;
      }

      this.isLoading = true;
      this.isPolling = false;
      this.errorMessage = '';
      this.campaignResult = null;
      this.campaignContent = '';
      this.showFullPreview = false;
      this.jobId = null;
      this.pollingAttempts = 0;
      this.pollingStartTime = Date.now();
      this.pollingElapsedTime = 0;
      this.pollingProgress = '0%';
      this.pollingProgressPercentage = 0;
      this.pollingMessage = 'Aguardando processamento...';

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('target_language', this.selectedLanguage);
      formData.append('complexity', this.selectedComplexity);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const response = await axios.post(`${apiUrl}/generate-campaign`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 202 && response.data.job_id) {
          // Processamento assíncrono iniciado
          this.jobId = response.data.job_id;
          this.isLoading = false;
          this.isPolling = true;

          // Iniciar polling
          this.startPolling();
        } else if (response.data.success && response.data.status === 'completed') {
          // Processamento síncrono (fallback sem Redis)
          this.isLoading = false;
          this.handleCampaignSuccess(response.data);
        } else {
          this.errorMessage = response.data.error || 'Erro ao iniciar processamento.';
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Erro ao gerar campanha:', error);
        this.handleCampaignError(error);
        this.isLoading = false;
      }
    },

    startPolling() {
      this.stopPolling(); // Limpar qualquer polling anterior

      this.pollingInterval = setInterval(() => {
        this.pollJobStatus();
      }, 2000); // Verificar a cada 2 segundos
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async pollJobStatus() {
      if (!this.jobId) {
        this.stopPolling();
        return;
      }

      this.pollingElapsedTime = Math.floor(
        (Date.now() - this.pollingStartTime) / 1000
      );

      this.pollingProgressPercentage = Math.min(
        95,
        Math.floor((this.pollingElapsedTime / 300) * 95)
      );
      this.pollingProgress = `${this.pollingProgressPercentage}%`;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const { data: statusData } = await axios.get(
          `${apiUrl}/job-status/${this.jobId}`
                );

        const result = statusData.result;

        if (statusData.status === 'completed') {
          this.stopPolling();
          this.isPolling = false;
          this.processingTime = this.pollingElapsedTime;

          // ⬇️ URL direta do S3
          const campaignUrl = result?.campaign_url;

          // Buscar conteúdo direto do S3
          await this.fetchFullCampaign(campaignUrl);

          this.campaignResult = {
            job_id: this.jobId,
            campaign_url: campaignUrl,
            preview: result?.preview,
            message: 'Campanha gerada com sucesso!'
          };

        } else if (statusData.status === 'failed') {
          this.stopPolling();
          this.isPolling = false;
          this.errorMessage =
            result?.error || statusData.message || 'Processamento falhou';

        } else if (statusData.status === 'processing') {
          this.pollingMessage = result?.progress || 'Processando...';
          this.pollingAttempts++;

        } else if (statusData.status === 'queued') {
          this.pollingMessage = 'Na fila de processamento...';
          this.pollingAttempts++;
        }

      } catch (error) {
        console.error('Erro ao verificar status:', error);
        this.pollingAttempts++;

        if (this.pollingAttempts >= 10) {
          this.stopPolling();
          this.isPolling = false;
          this.errorMessage = 'Erro ao verificar status do processamento.';
        }
      }
    },


    async fetchFullCampaign(campaignUrl) {
      if (!campaignUrl) return;

      try {
        const response = await axios.get(campaignUrl, {
          responseType: 'text',
        });

        this.campaignContent = response.data;

      } catch (error) {
        console.error('Erro ao buscar campanha:', error);

        if (this.campaignResult?.preview) {
          this.campaignContent = this.campaignResult.preview;
        } else {
          this.campaignContent = 'Conteúdo da campanha não disponível.';
        }
      }
    },


    handleCampaignSuccess(data) {
      this.campaignResult = data;
      this.campaignContent = data.preview || 'Campanha gerada com sucesso!';
      this.processingTime = 0; // Processamento instantâneo
    },

    handleCampaignError(error) {
      if (error.response?.data?.error) {
        this.errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        this.errorMessage = 'Tempo limite excedido. Tente novamente com um arquivo menor.';
      } else if (error.message.includes('Network Error')) {
        this.errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
      } else {
        this.errorMessage = 'Erro ao processar a requisição. Tente novamente.';
      }
    },

    retryPolling() {
      if (this.jobId) {
        this.isPolling = true;
        this.errorMessage = '';
        this.pollingAttempts = 0;
        this.pollingStartTime = Date.now();
        this.startPolling();
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },

    async downloadFormattedPDF() {
      if (!this.campaignContent) return;

      try {
        // Usar a API do browser para imprimir como PDF
        const printWindow = window.open('', '_blank');
        const formattedContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Campanha RPG - ${this.getComplexityInfo(this.selectedComplexity).name}</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background: white;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 3px solid #8b5cf6; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px;
                }
                h1 { 
                  color: white; 
                  margin: 0; 
                  font-size: 2.5em;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                h2 { 
                  color: #7c3aed; 
                  border-bottom: 2px solid #ddd; 
                  padding-bottom: 5px; 
                  margin-top: 30px;
                }
                h3 { color: #6d28d9; }
                .stats { 
                  display: grid; 
                  grid-template-columns: repeat(2, 1fr); 
                  gap: 15px; 
                  margin: 20px 0; 
                }
                .stat-card { 
                  background: #f8fafc; 
                  padding: 15px; 
                  border-radius: 8px; 
                  border-left: 4px solid #8b5cf6;
                  text-align: center;
                }
                .session { 
                  background: #f1f5f9; 
                  padding: 20px; 
                  margin: 15px 0; 
                  border-radius: 8px; 
                  border-left: 4px solid #10b981;
                }
                .npc { 
                  background: #f0f9ff; 
                  padding: 15px; 
                  margin: 10px 0; 
                  border-radius: 6px; 
                  border-left: 4px solid #0ea5e9;
                }
                .reward { 
                  background: #fefce8; 
                  padding: 15px; 
                  margin: 10px 0; 
                  border-radius: 6px; 
                  border-left: 4px solid #eab308;
                }
                @media print {
                  body { font-size: 12pt; }
                  .header { break-after: avoid; }
                  .session { break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎲 ${this.getComplexityInfo(this.selectedComplexity).name}</h1>
                <p><strong>Idioma:</strong> ${this.getLanguageName(this.selectedLanguage)} | 
                   <strong>Duração:</strong> ${this.getComplexityInfo(this.selectedComplexity).duration} | 
                   <strong>Sessões:</strong> ${this.getComplexityInfo(this.selectedComplexity).sessions}</p>
                <p><em>Gerado em ${new Date().toLocaleDateString('pt-BR')}</em></p>
              </div>
              <div>${this.formattedCampaign}</div>
            </body>
          </html>
        `;

        printWindow.document.write(formattedContent);
        printWindow.document.close();

        // Aguardar o conteúdo carregar antes de imprimir
        printWindow.onload = () => {
          printWindow.print();
        };
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        // Fallback para impressão normal
        window.print();
      }
    },

    createFormattedContent() {
      const complexityInfo = this.getComplexityInfo(this.selectedComplexity);
      return `# 🎲 ${complexityInfo.name}

**Idioma:** ${this.getLanguageName(this.selectedLanguage)}  
**Complexidade:** ${this.selectedComplexity}  
**Sessões:** ${complexityInfo.sessions}  
**Duração:** ${complexityInfo.duration}  
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}
**Tempo de processamento:** ${this.formatTime(this.processingTime)}

---

${this.campaignContent}

---

*Campanha gerada automaticamente pelo RPG Campaign Generator*  
*Sistema baseado no livro de RPG analisado - balanceamento pode precisar de ajustes para seu grupo específico.*
`;
    },

    togglePreview() {
      this.showFullPreview = !this.showFullPreview;
    },

    async loadExample() {
      this.isLoading = true;
      this.errorMessage = '';
      this.campaignResult = null;
      this.campaignContent = '';
      this.showFullPreview = false;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const response = await axios.get(`${apiUrl}/example-campaign`, {
          params: {
            complexity: this.selectedComplexity,
            language: this.selectedLanguage
          },
        });

        if (response.data.success) {
          this.campaignResult = response.data;
          this.campaignContent = response.data.content || 'Exemplo de campanha carregado.';
        }
      } catch (error) {
        console.error('Erro ao carregar exemplo:', error);
        this.errorMessage = 'Erro ao carregar exemplo.';
      } finally {
        this.isLoading = false;
      }
    },

    generateNewCampaign() {
      this.campaignResult = null;
      this.campaignContent = '';
      this.showFullPreview = false;
      this.jobId = null;
      this.isPolling = false;
      this.stopPolling();
      this.clearFile();
    },

    getComplexityInfo(complexityId) {
      return this.complexities.find(c => c.id === complexityId) || this.complexities[1];
    },

    getLanguageName(languageCode) {
      const lang = this.languages.find(l => l.code === languageCode);
      return lang ? lang.name : languageCode;
    },

    async fetchComplexities() {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const response = await axios.get(`${apiUrl}/campaign-complexities`);
        if (response.data) {
          this.complexities = Object.entries(response.data).map(([id, data]) => ({
            id,
            ...data
          }));
        }
      } catch (error) {
        console.log('Usando complexidades padrão');
      }
    },

    printCampaign() {
      window.print();
    },

    async copyToClipboard() {
      try {
        const formattedContent = this.createFormattedContent();
        await navigator.clipboard.writeText(formattedContent);
        alert('Campanha copiada para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar:', error);
        alert('Erro ao copiar para a área de transferência.');
      }
    }
  }
};
</script>

<style>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Prose styling for campaign content */
.prose {
  color: #e5e7eb;
}

.prose h1 {
  color: #10b981;
  font-size: 2.25em;
  font-weight: bold;
  margin-bottom: 1em;
  border-bottom: 2px solid #10b981;
  padding-bottom: 0.5em;
}

.prose h2 {
  color: #8b5cf6;
  font-size: 1.875em;
  font-weight: bold;
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose h3 {
  color: #60a5fa;
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.prose strong {
  color: #fbbf24;
  font-weight: 600;
}

.prose em {
  color: #a5b4fc;
  font-style: italic;
}

.prose ul,
.prose ol {
  margin: 1em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.5em 0;
}

.prose blockquote {
  border-left: 4px solid #8b5cf6;
  padding-left: 1em;
  margin: 1.5em 0;
  font-style: italic;
  color: #cbd5e1;
}

.prose code {
  background: #374151;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-family: 'Courier New', monospace;
  color: #f3f4f6;
}

.prose pre {
  background: #1f2937;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1.5em 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}

.prose th,
.prose td {
  border: 1px solid #4b5563;
  padding: 0.75em;
  text-align: left;
}

.prose th {
  background: #374151;
  color: #f9fafb;
  font-weight: 600;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }

  .prose {
    color: black !important;
  }

  .prose h1,
  .prose h2,
  .prose h3 {
    color: #1f2937 !important;
  }
}
</style>