<template>
  <div id="app" class="flex flex-col justify-center items-center h-screen bg-gray-100">
    <!-- Botão ou Carregamento -->
    <div class="relative">
      <button 
        v-if="!isLoading"
        @click="selectFile"
        class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
      >
        Slect file
      </button>

      <!-- Loading ocupa o tamanho do botão -->
      <div v-else class="px-6 py-3 bg-blue-400 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2">
        <svg class="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    </div>

    <!-- Input de arquivo oculto -->
    <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />

    <!-- Link para download do PDF -->
    <a 
      v-if="pdfLink" 
      :href="pdfLink" 
      download="arquivo-gerado.pdf" 
      class="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
    >
      📄 Download PDF
    </a>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      selectedFile: null,
      pdfLink: null,  // Link para o PDF gerado
      isLoading: false,  // Controla o estado de carregamento
    };
  },
  methods: {
    // Método que é chamado ao clicar no botão
    selectFile() {
      // Aciona o clique no input de arquivo oculto
      this.$refs.fileInput.click();
    },

    // Método que é chamado quando o arquivo é selecionado
    handleFileChange(event) {
      // Obtém o arquivo selecionado
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        console.log('Arquivo selecionado:', file.name);
        // Envia o arquivo para o backend
        this.uploadFile();
      }
    },

    // Método para enviar o arquivo para o backend
    uploadFile() {
      if (!this.selectedFile) {
        alert('Nenhum arquivo selecionado');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      // Exibe o carregamento
      this.isLoading = true;

      const apiUrl = import.meta.env.VITE_API_URL;


      // Substitua pela URL do seu backend
      const url = `${apiUrl}/upload`;

      // Envia a requisição POST com o arquivo
      axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Necessário para enviar arquivos
        }
      })
        .then(response => {
          // Backend retorna um JSON com a URL do PDF
          const downloadUrl = `${apiUrl}${response.data.download_url}`;

          // Agora faz outra requisição para baixar o PDF
          axios.get(downloadUrl, { responseType: 'blob' })
            .then(res => {
              const pdfBlob = res.data;
              this.createDownloadLink(pdfBlob);
            })
            .catch(err => {
              console.error('Erro ao baixar o PDF:', err);
            });
        })
        .catch(error => {
          console.error('Erro ao enviar o arquivo:', error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    // Método para criar o link de download do PDF
    createDownloadLink(pdfBlob) {
      // Cria uma URL temporária para o PDF
      const link = URL.createObjectURL(pdfBlob);
      // Atribui o link à variável pdfLink para exibir o link de download
      this.pdfLink = link;
    },
  },
};
</script>

<style scoped>
/* Não é necessário adicionar estilos adicionais, já que estamos utilizando o Tailwind CSS */
</style>
