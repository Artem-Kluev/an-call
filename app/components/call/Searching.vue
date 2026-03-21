<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
const { t } = useI18n();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "matched"): void;
}>();

const totalTips = 10;
const currentTipIndex = ref(0);
let tipsInterval: any = null;

onMounted(() => {
  currentTipIndex.value = Math.floor(Math.random() * totalTips);

  tipsInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % totalTips;
  }, 10000);
});

onUnmounted(() => {
  clearInterval(tipsInterval);
});
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-20 text-center">
      <div class="relative">
        <div class="bg-primary/20 absolute inset-0 animate-ping rounded-full"></div>

        <div class="bg-primary/10 relative flex aspect-square w-40 items-center justify-center rounded-full">
          <UIcon name="i-heroicons-magnifying-glass" class="text-primary text-5xl" />
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
      <UButton
        size="xl"
        color="error"
        block
        class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl"
        @click="$emit('cancel')"
      >
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
