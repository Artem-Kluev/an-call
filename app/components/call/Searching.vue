<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
const { t } = useI18n();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "matched"): void;
}>();

const totalTips = 10;
const currentTipIndex = ref(Math.floor(Math.random() * totalTips));
const searchTimer = ref(0);
let searchInterval: any = null;
let tipsInterval: any = null;

onMounted(() => {
  searchInterval = setInterval(() => {
    searchTimer.value++;
    if (searchTimer.value >= 3) {
      clearInterval(searchInterval);
      emit("matched");
    }
  }, 1000);

  tipsInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % totalTips;
  }, 10000);
});

onUnmounted(() => {
  clearInterval(searchInterval);
  clearInterval(tipsInterval);
});
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-20 text-center">
      <div class="relative">
        <div class="bg-primary/20 absolute inset-0 animate-ping rounded-full"></div>
        <div class="bg-primary/10 relative rounded-full p-12">
          <UIcon name="i-heroicons-magnifying-glass" class="text-primary h-20 w-20 text-4xl" />
        </div>
      </div>
      <h2 class="text-title animate-pulse text-xl font-bold">{{ t("call.searching.status") }}</h2>

      <div class="flex h-20 items-center justify-center px-6">
        <Transition name="fade" mode="out-in">
          <p :key="currentTipIndex" class="text-subtitle text-md max-w-xs text-center leading-relaxed italic">
            "{{ t(`call.searching.tips.${currentTipIndex}`) }}"
          </p>
        </Transition>
      </div>
    </div>
    <div class="flex w-full pt-8">
      <UButton block color="error" class="rounded-2xl px-12 py-4 text-lg" @click="$emit('cancel')">
        {{ t("call.searching.cancel") }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
