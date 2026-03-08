import { ref } from "vue";

const isVisible = ref(false);
const message = ref("");
const type = ref<"success" | "info" | "error">("success");
let timeoutId: any = null;

export const useCustomToast = () => {
  const showToast = (msg: string, toastType: "success" | "info" | "error" = "success", duration = 3000) => {
    if (timeoutId) clearTimeout(timeoutId);

    message.value = msg;
    type.value = toastType;
    isVisible.value = true;

    timeoutId = setTimeout(() => {
      isVisible.value = false;
    }, duration);
  };

  return {
    isVisible,
    message,
    type,
    showToast,
  };
};
