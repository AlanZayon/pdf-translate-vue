import { ref } from 'vue';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function useFileUpload() {
  const selectedFile = ref(null);
  const dragOver = ref(false);
  const fileError = ref('');

  function validateFile(file) {
    if (!file) return 'No file selected';
    if (file.type !== 'application/pdf') return 'Please select a PDF file.';
    if (file.size > MAX_FILE_SIZE) return 'File exceeds 50MB limit.';
    return '';
  }

  function setFile(file) {
    const error = validateFile(file);
    if (error) {
      fileError.value = error;
      selectedFile.value = null;
      return false;
    }
    fileError.value = '';
    selectedFile.value = file;
    return true;
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) setFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    dragOver.value = false;
    const file = event.dataTransfer.files?.[0];
    if (file) setFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    dragOver.value = true;
  }

  function handleDragLeave() {
    dragOver.value = false;
  }

  function clearFile(fileInputRef) {
    selectedFile.value = null;
    fileError.value = '';
    if (fileInputRef?.value) fileInputRef.value = '';
  }

  return {
    selectedFile,
    dragOver,
    fileError,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    validateFile,
  };
}
