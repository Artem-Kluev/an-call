<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
defineEmits<{
  (e: "reset"): void;
}>();
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-8 text-center">
      <div class="bg-primary/5 relative flex aspect-square w-40 items-center justify-center rounded-full">
        <UIcon name="i-heroicons-signal-slash" class="text-primary h-16 w-16 text-5xl" />
      </div>
      <div class="space-y-2">
        <h2 class="text-title mb-4 text-3xl font-black">{{ t("call.disconnected.title") }}</h2>
        <p class="text-subtitle text-lg">{{ t("call.disconnected.text") }}</p>
      </div>
    </div>
    <div class="flex flex-col gap-2 pt-8">
      <UButton
        size="xl"
        block
        class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl"
        @click="$emit('reset')"
      >
        {{ t("call.disconnected.button") }}
      </UButton>

      <UButton
        size="xl"
        block
        variant="ghost"
        color="neutral"
        class="text-subtitle rounded-full py-6 text-lg font-bold"
        :to="localePath('/')"
      >
        {{ t("call.disconnected.exit") }}
      </UButton>
    </div>
  </div>
</template>
