import { ref, onUnmounted, computed, onMounted } from "vue";

export const useWakeLock = () => {
  const sentinel = ref<any>(null);
  // Прапорець, чи ПОВИНЕН бути активний замок за логікою програми
  const shouldBeActive = ref(false);

  const request = async () => {
    if (!import.meta.client || !("wakeLock" in navigator)) return;

    try {
      sentinel.value = await (navigator as any).wakeLock.request("screen");
      shouldBeActive.value = true;

      sentinel.value.addEventListener("release", () => {
        console.log("Wake Lock was released");
        // Не скидаємо shouldBeActive, бо ми хочемо його відновити пізніше
        sentinel.value = null;
      });

      console.log("Wake Lock is active ☀️");
    } catch (err) {
      console.warn("Failed to request Wake Lock:", err);
    }
  };

  const release = async () => {
    shouldBeActive.value = false;
    if (sentinel.value) {
      await sentinel.value.release();
      sentinel.value = null;
    }
  };

  // ФІКС: Автоматичне відновлення при поверненні на вкладку
  const handleVisibilityChange = async () => {
    if (document.visibilityState === "visible" && shouldBeActive.value && !sentinel.value) {
      await request();
    }
  };

  if (import.meta.client) {
    onMounted(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    });

    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      release();
    });
  }

  return {
    requestWakeLock: request,
    releaseWakeLock: release,
    isActive: computed(() => !!sentinel.value),
  };
};
