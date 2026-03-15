<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
const { t } = useI18n();

const emit = defineEmits<{
  (e: "end"): void;
}>();

const timer = ref(180); // 3 minutes in seconds
let timerInterval: any = null;

const isLocked = ref(false);
const lastTapTime = ref(0);
let lockTimeout: any = null;

const formattedTime = computed(() => {
  const mins = Math.floor(timer.value / 60);
  const secs = timer.value % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
});

const startLockTimer = (delay = 5000) => {
  if (lockTimeout) clearTimeout(lockTimeout);
  lockTimeout = setTimeout(() => {
    isLocked.value = true;
  }, delay);
};

const handleUnlockTap = () => {
  const now = Date.now();
  if (now - lastTapTime.value < 300) {
    isLocked.value = false;
    startLockTimer(3000);
  }
  lastTapTime.value = now;
};

const { playBeep } = useAudio();

onMounted(() => {
  playBeep(880, 0.2); // Start beep

  timerInterval = setInterval(() => {
    timer.value--;

    if (timer.value === 10) {
      playBeep(440, 0.3); // Warning beep
    }

    if (timer.value <= 0) {
      clearInterval(timerInterval);
      emit("end");
    }
  }, 1000);

  // Start initial lock timer with 2 seconds delay
  startLockTimer(2000);
});

onUnmounted(() => {
  clearInterval(timerInterval);
  if (lockTimeout) clearTimeout(lockTimeout);
});
</script>

<template>
  <div class="relative flex grow flex-col items-center justify-between py-12">
    <div class="space-y-4 text-center">
      <div class="bg-primary/10 mx-auto mb-10 flex aspect-square w-40 items-center justify-center rounded-full">
        <UIcon name="i-heroicons-user" class="text-primary h-24 w-24 text-7xl" />
      </div>

      <h2 class="text-primary text-p max-w-70 text-2xl font-bold">{{ t("call.active.partner") }}</h2>
    </div>

    <div class="w-full text-center">
      <p class="text-subtitle mb-2">{{ t("call.active.timer") }}</p>

      <div
        class="mb-12 font-mono text-6xl font-black transition-colors duration-300"
        :class="timer <= 10 ? 'text-error' : 'text-primary'"
      >
        {{ formattedTime }}
      </div>

      <UButton
        color="error"
        variant="soft"
        class="shadow-error/20 active:bg-error active:text-background mx-auto flex h-22 w-22 items-center justify-center rounded-full shadow-lg active:scale-95"
        @click="$emit('end')"
      >
        <UIcon name="i-heroicons-phone-x-mark" class="h-10 w-10 text-2xl" />
      </UButton>
    </div>

    <!-- Lock Screen Overlay -->
    <div
      v-if="isLocked"
      class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-gray-950/80 transition-all duration-300"
      @click="handleUnlockTap"
    >
      <p class="px-16 text-center text-xl leading-relaxed font-black text-white">
        {{ t("call.active.lock.instruction") }}
      </p>
      <div class="mt-10 flex gap-4">
        <div v-for="i in 2" :key="i" class="h-2 w-10 overflow-hidden rounded-full border border-white/5 bg-white/10">
          <div v-if="Date.now() - lastTapTime < 300 && i === 1" class="bg-primary h-full w-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>
