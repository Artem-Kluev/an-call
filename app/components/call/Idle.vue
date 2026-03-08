<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
defineEmits<{
  (e: "start"): void;
}>();
</script>

<template>
  <div class="flex grow flex-col">
    <!-- Header -->
    <div class="mb-4 flex items-center">
      <NuxtLink
        :to="localePath('/')"
        class="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 transition-all hover:bg-gray-100 active:scale-90 dark:border-gray-800 dark:bg-gray-800/50"
      >
        <UIcon name="i-heroicons-chevron-left" class="h-6 w-6" />
      </NuxtLink>
    </div>

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
        class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl"
        @click="$emit('start')"
      >
        {{ t("call.idle.start") }}
      </UButton>
    </div>
  </div>
</template>
