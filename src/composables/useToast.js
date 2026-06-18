import { ref } from 'vue';

const toastMessage = ref('');
const toastVisible = ref(false);
let toastTimer = null;

export function useToast() {
  function showToast(message, durationMs = 3000) {
    toastMessage.value = message;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, durationMs);
  }

  return { toastMessage, toastVisible, showToast };
}
