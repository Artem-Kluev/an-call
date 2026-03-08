<script setup lang="ts">
const { t } = useI18n();
defineEmits<{
  (e: "choice", liked: boolean): void;
}>();
</script>

<template>
  <div class="flex grow flex-col items-center justify-center space-y-12 px-4 text-center">
    <div class="space-y-6">
      <div
        class="bg-primary/5 mx-auto flex h-24 w-24 items-center justify-center rounded-full transition-transform duration-700 hover:rotate-12"
      >
        <UIcon name="ic:round-telegram" class="text-primary/80 h-12 w-12 text-5xl" />
      </div>
      <h2 class="text-title text-2xl leading-tight font-black">
        {{ t("call.decision.title") }}
      </h2>
    </div>

    <div class="flex w-full flex-col gap-8 pt-8">
      <UButton
        size="lg"
        block
        color="primary"
        icon="i-heroicons-sparkles-20-solid"
        class="shadow-primary/40 hover:shadow-primary/60 rounded-2xl py-4 text-xl font-black shadow-2xl transition-all active:scale-95"
        @click="$emit('choice', true)"
      >
        {{ t("call.decision.like") }}
      </UButton>
      <UButton
        size="lg"
        block
        variant="link"
        color="neutral"
        class="font-bold text-gray-400 transition-colors hover:text-gray-600"
        @click="$emit('choice', false)"
      >
        {{ t("call.decision.decline") }}
      </UButton>
    </div>
  </div>
</template>
