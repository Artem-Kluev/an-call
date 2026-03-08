<script setup lang="ts">
const { t } = useI18n();
defineEmits<{
  (e: "start"): void;
}>();
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-8 text-center">
      <div class="bg-primary/10 rounded-full p-8">
        <UIcon name="i-heroicons-microphone" class="text-primary h-24 w-24 text-7xl" />
      </div>
      <div class="space-y-2">
        <h1 class="text-title text-3xl font-black">{{ t("call.title") }}</h1>
        <p class="text-subtitle">{{ t("call.subtitle") }}</p>
      </div>
    </div>
    <div class="w-full pt-8">
      <UButton
        size="xl"
        block
        class="shadow-primary/20 rounded-2xl py-4 text-lg font-bold shadow-xl"
        @click="$emit('start')"
      >
        {{ t("call.idle.start") }}
      </UButton>
    </div>
  </div>
</template>
