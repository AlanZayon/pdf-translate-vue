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
              <p class="text-gray-300 text-sm">Transform RPG books into ready-to-play campaigns</p>
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
            <h2 class="text-3xl font-bold mb-4">Create New Campaign</h2>
            <p class="text-gray-300 text-lg">
              Upload an RPG book and receive a complete, ready-to-play campaign
            </p>
          </div>

          <!-- Configuration Options -->
          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <!-- Language Selection -->
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-300">
                🌍 Campaign Language
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
                ⚡ Complexity
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
                  {{ selectedFile ? selectedFile.name : 'Select your RPG book' }}
                </h3>
                <p class="text-gray-300">
                  Drag a PDF file or click to select
                </p>
              </div>

              <div v-if="!selectedFile" class="text-sm text-gray-400">
                Supported formats: PDF (max. 50MB)
              </div>

              <button v-if="selectedFile && !isLoading" @click.stop="clearFile"
                class="px-4 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-red-600 hover:bg-opacity-30 transition">
                Remove File
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
              <span v-if="!isLoading && !isPolling">🎲 Generate Campaign</span>
              <span v-else class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                </svg>
                <span>{{ isPolling ? `Processing... ${pollingProgress}` : 'Uploading file...' }}</span>
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
              <h3 class="font-semibold text-blue-400 text-xl">Processing your campaign...</h3>
              <p class="text-blue-300 mt-2">{{ pollingMessage }}</p>

              <!-- Progress Bar -->
              <div class="mt-4">
                <div class="flex justify-between text-sm text-blue-300 mb-2">
                  <span>{{ pollingProgress }}</span>
                  <span>Elapsed time: {{ formatTime(pollingElapsedTime) }}</span>
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
            <h2 class="text-3xl font-bold text-green-400 mb-2">Campaign Generated Successfully!</h2>
            <p class="text-gray-300 text-lg">Your campaign is ready to play</p>
          </div>

          <!-- Campaign Preview -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold flex items-center space-x-2">
                <span>📖</span>
                <span>Campaign Preview</span>
              </h3>
              <button @click="togglePreview"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm">
                {{ showFullPreview ? 'Show Less' : 'Show More' }}
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
              <div class="text-sm text-gray-300">Complexity</div>
              <div class="font-semibold">{{ getComplexityDisplayName(selectedComplexity) }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">🌍</div>
              <div class="text-sm text-gray-300">Language</div>
              <div class="font-semibold">{{ getLanguageName(selectedLanguage) }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">⏱️</div>
              <div class="text-sm text-gray-300">Duration</div>
              <div class="font-semibold">{{ getComplexityInfo(selectedComplexity).duration }}</div>
            </div>
            <div class="bg-gray-700 rounded-lg p-4 text-center">
              <div class="text-2xl mb-2">📅</div>
              <div class="text-sm text-gray-300">Sessions</div>
              <div class="font-semibold">{{ getComplexityInfo(selectedComplexity).sessions }}</div>
            </div>
          </div>

          <!-- Download Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a :href="campaignResult.campaign_url" target="_blank"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 transition transform hover:scale-105 flex items-center justify-center space-x-3 text-center">
              <span>📥</span>
              <span>Download Campaign</span>
            </a>

            <button @click="downloadFormattedPDF"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 flex items-center justify-center space-x-3">
              <span>🖨️</span>
              <span>Download Formatted PDF</span>
            </button>

            <button @click="generateNewCampaign"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105 flex items-center justify-center space-x-3">
              <span>🎲</span>
              <span>New Campaign</span>
            </button>
          </div>

          <!-- Job Info -->
          <div class="mt-6 text-center text-sm text-gray-400">
            <p class="mt-1">Total processing time: {{ formatTime(processingTime) }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage"
          class="mt-8 bg-red-900 bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-red-500">
          <div class="flex items-center space-x-4">
            <span class="text-3xl">❌</span>
            <div>
              <h3 class="font-semibold text-red-400 text-xl">Error generating campaign</h3>
              <p class="text-red-300 mt-2">{{ errorMessage }}</p>
              <button v-if="jobId" @click="retryPolling"
                class="mt-4 px-4 py-2 bg-red-700 rounded-lg hover:bg-red-600 transition text-sm">
                Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- Example Section -->
        <div class="mt-12 text-center">
          <button @click="loadExample" :disabled="isLoading || isPolling"
            class="px-8 py-4 bg-gray-700 bg-opacity-50 border-2 border-gray-600 rounded-xl hover:bg-gray-600 hover:border-gray-500 transition text-gray-300 text-lg font-semibold">
            🎯 View Campaign Example
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 bg-opacity-50 border-t border-gray-700 mt-16">
      <div class="container mx-auto px-4 py-8 text-center">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-400">RPG Campaign Generator - Transform books into epic adventures</p>
          <div class="flex space-x-4">
            <button @click="printCampaign" v-if="campaignResult && !isPolling"
              class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300">
              🖨️ Print
            </button>
            <button @click="copyToClipboard" v-if="campaignResult && !isPolling"
              class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300">
              📋 Copy
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
      selectedLanguage: 'en',
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
      maxPollingAttempts: 300, // 5 minutes (300 * 1 second)
      pollingStartTime: null,
      pollingElapsedTime: 0,
      pollingProgress: '0%',
      pollingProgressPercentage: 0,
      pollingMessage: 'Waiting for processing...',
      processingTime: 0,

      languages: [
        { code: 'pt', name: 'Portuguese', backendCode: 'pt' },
        { code: 'en', name: 'English', backendCode: 'en' },
        { code: 'es', name: 'Spanish', backendCode: 'es' },
        { code: 'fr', name: 'French', backendCode: 'fr' },
        { code: 'de', name: 'German', backendCode: 'de' },
        { code: 'it', name: 'Italian', backendCode: 'it' },
        { code: 'ja', name: 'Japanese', backendCode: 'ja' },
        { code: 'ko', name: 'Korean', backendCode: 'ko' },
        { code: 'zh', name: 'Chinese', backendCode: 'zh' },
        { code: 'ru', name: 'Russian', backendCode: 'ru' }
      ],

      complexities: [
        { id: 'simple', backendId: 'simples', name: 'Simple Campaign', sessions: '1-2 sessions', description: 'Straightforward story, perfect for oneshots', duration: '3-8 hours', focus: 'Combat and clear objectives' },
        { id: 'medium', backendId: 'mediana', name: 'Medium Campaign', sessions: '3-4 sessions', description: 'Balance between combat, exploration, and development', duration: '9-16 hours', focus: 'Story with branching paths' },
      ],

      // Mapeamento para converter código de idioma frontend para backend
      languageMapping: {
        'en': 'en',
        'pt': 'pt',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'ja': 'ja',
        'ko': 'ko',
        'zh': 'zh',
        'ru': 'ru'
      },

      // Mapeamento para converter complexidade frontend para backend
      complexityMapping: {
        'simple': 'simples',
        'medium': 'mediana',
      }
    };
  },

  computed: {
    formattedCampaign() {
      if (!this.campaignContent) return '';

      // Configure marked for safe rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false
      });

      return marked(this.campaignContent);
    },

    // Computed properties to get backend values
    backendLanguage() {
      return this.languageMapping[this.selectedLanguage] || 'en';
    },

    backendComplexity() {
      return this.complexityMapping[this.selectedComplexity] || 'mediana';
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
          this.errorMessage = 'Please select a PDF file.';
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
          this.errorMessage = 'Please drop a PDF file.';
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
        this.errorMessage = 'Please select a PDF file.';
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
      this.pollingMessage = 'Waiting for processing...';

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      // Usar os valores em português para o backend
      formData.append('target_language', this.backendLanguage);
      formData.append('complexity', this.backendComplexity);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const response = await axios.post(`${apiUrl}/generate-campaign`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 202 && response.data.job_id) {
          // Async processing started
          this.jobId = response.data.job_id;
          this.isLoading = false;
          this.isPolling = true;

          // Start polling
          this.startPolling();
        } else if (response.data.success && response.data.status === 'completed') {
          // Sync processing (Redis fallback)
          this.isLoading = false;
          this.handleCampaignSuccess(response.data);
        } else {
          this.errorMessage = response.data.error || 'Error starting processing.';
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Error generating campaign:', error);
        this.handleCampaignError(error);
        this.isLoading = false;
      }
    },

    startPolling() {
      this.stopPolling(); // Clear any previous polling

      this.pollingInterval = setInterval(() => {
        this.pollJobStatus();
      }, 2000); // Check every 2 seconds
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

          // ⬇️ Direct S3 URL
          const campaignUrl = result?.campaign_url;

          // Fetch content directly from S3
          await this.fetchFullCampaign(campaignUrl);

          this.campaignResult = {
            job_id: this.jobId,
            campaign_url: campaignUrl,
            preview: result?.preview,
            message: 'Campaign generated successfully!'
          };

        } else if (statusData.status === 'failed') {
          this.stopPolling();
          this.isPolling = false;
          this.errorMessage =
            result?.error || statusData.message || 'Processing failed';

        } else if (statusData.status === 'processing') {
          this.pollingMessage = result?.progress || 'Processing...';
          this.pollingAttempts++;

        } else if (statusData.status === 'queued') {
          this.pollingMessage = 'Queued for processing...';
          this.pollingAttempts++;
        }

      } catch (error) {
        console.error('Error checking status:', error);
        this.pollingAttempts++;

        if (this.pollingAttempts >= 10) {
          this.stopPolling();
          this.isPolling = false;
          this.errorMessage = 'Error checking processing status.';
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
        console.error('Error fetching campaign:', error);

        if (this.campaignResult?.preview) {
          this.campaignContent = this.campaignResult.preview;
        } else {
          this.campaignContent = 'Campaign content not available.';
        }
      }
    },

    handleCampaignSuccess(data) {
      this.campaignResult = data;
      this.campaignContent = data.preview || 'Campaign generated successfully!';
      this.processingTime = 0; // Instant processing
    },

    handleCampaignError(error) {
      if (error.response?.data?.error) {
        this.errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        this.errorMessage = 'Timeout exceeded. Try again with a smaller file.';
      } else if (error.message.includes('Network Error')) {
        this.errorMessage = 'Connection error. Check if the server is running.';
      } else {
        this.errorMessage = 'Error processing request. Please try again.';
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
        // Use browser API to print as PDF
        const printWindow = window.open('', '_blank');
        const formattedContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>RPG Campaign - ${this.getComplexityInfo(this.selectedComplexity).name}</title>
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
                <p><strong>Language:</strong> ${this.getLanguageName(this.selectedLanguage)} | 
                   <strong>Duration:</strong> ${this.getComplexityInfo(this.selectedComplexity).duration} | 
                   <strong>Sessions:</strong> ${this.getComplexityInfo(this.selectedComplexity).sessions}</p>
                <p><em>Generated on ${new Date().toLocaleDateString('en-US')}</em></p>
              </div>
              <div>${this.formattedCampaign}</div>
            </body>
          </html>
        `;

        printWindow.document.write(formattedContent);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
          printWindow.print();
        };
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to normal printing
        window.print();
      }
    },

    createFormattedContent() {
      const complexityInfo = this.getComplexityInfo(this.selectedComplexity);
      return `# 🎲 ${complexityInfo.name}

**Language:** ${this.getLanguageName(this.selectedLanguage)}  
**Complexity:** ${this.getComplexityDisplayName(this.selectedComplexity)}  
**Sessions:** ${complexityInfo.sessions}  
**Duration:** ${complexityInfo.duration}  
**Generated on:** ${new Date().toLocaleDateString('en-US')}
**Processing time:** ${this.formatTime(this.processingTime)}

---

${this.campaignContent}

---

*Campaign automatically generated by RPG Campaign Generator*  
*System based on the analyzed RPG book - balancing may need adjustments for your specific group.*
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
            complexity: this.backendComplexity,
            language: this.backendLanguage
          },
        });

        if (response.data.success) {
          this.campaignResult = response.data;
          this.campaignContent = response.data.content || 'Example campaign loaded.';
        }
      } catch (error) {
        console.error('Error loading example:', error);
        this.errorMessage = 'Error loading example.';
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

    getComplexityDisplayName(complexityId) {
      const info = this.getComplexityInfo(complexityId);
      return info ? info.name : complexityId;
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
          // Keep our frontend complexities but update from backend if needed
          console.log('Complexities from backend:', response.data);
        }
      } catch (error) {
        console.log('Using default complexities');
      }
    },

    printCampaign() {
      window.print();
    },

    async copyToClipboard() {
      try {
        const formattedContent = this.createFormattedContent();
        await navigator.clipboard.writeText(formattedContent);
        alert('Campaign copied to clipboard!');
      } catch (error) {
        console.error('Error copying:', error);
        alert('Error copying to clipboard.');
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