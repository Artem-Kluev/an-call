<script setup lang="ts">
const { t } = useI18n();
defineEmits<{
  (e: "cancel"): void;
}>();
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-20 px-4 text-center">
      <div class="relative">
        <div class="bg-primary/5 relative flex aspect-square w-40 items-center justify-center rounded-full">
          <UIcon name="material-symbols:alarm" class="text-primary h-16 w-16 animate-pulse text-5xl" />
        </div>
      </div>
      <div class="space-y-4">
        <h2 class="text-title text-2xl font-black">{{ t("call.waiting.title") }}</h2>
        <p class="text-subtitle">{{ t("call.waiting.text") }}</p>
      </div>
    </div>
    <div class="w-full pt-8">
      <UButton
        size="xl"
        block
        variant="ghost"
        color="neutral"
        class="rounded-2xl py-6 font-bold text-gray-400"
        @click="$emit('cancel')"
      >
        {{ t("call.waiting.cancel") }}
      </UButton>
    </div>
  </div>
</template>
