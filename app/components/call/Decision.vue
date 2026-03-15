<script setup lang="ts">
const { t } = useI18n();
defineEmits<{
  (e: "choice", liked: boolean): void;
}>();
</script>

<template>
  <div class="flex grow flex-col items-center justify-between space-y-12 text-center">
    <div class="flex flex-col items-center space-y-6 pt-24">
      <div class="bg-primary/10 flex aspect-square w-40 items-center justify-center rounded-full">
        <UIcon name="mdi:telegram" class="text-primary h-24 w-24 text-7xl" />
      </div>
      <h2 class="text-title text-2xl leading-tight font-black">
        {{ t("call.decision.title") }}
      </h2>

      <p class="text-subtitle text">{{ t("call.decision.text") }}</p>
    </div>

    <div class="flex w-full flex-col gap-2 pt-8">
      <UButton
        size="xl"
        block
        class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl"
        @click="$emit('choice', true)"
      >
        {{ t("call.decision.like") }}
      </UButton>
      <UButton
        size="xl"
        block
        variant="ghost"
        color="neutral"
        class="text-subtitle rounded-full py-6 text-lg font-bold"
        @click="$emit('choice', false)"
      >
        {{ t("call.decision.decline") }}
      </UButton>
    </div>
  </div>
</template>
