<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const { showToast } = useCustomToast();

defineEmits<{
  (e: "reset"): void;
}>();

const handleCopy = () => {
  navigator.clipboard.writeText("@anonymous_crush");
  showToast(t("call.matched.copied"), "success");
};
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-8 px-4 text-center">
      <div class="bg-primary/10 flex aspect-square w-40 items-center justify-center rounded-full">
        <UIcon name="mdi:checkbox-marked-circle-outline" class="text-primary h-24 w-24 text-5xl" />
      </div>
      <div class="space-y-4">
        <h2 class="text-title text-3xl font-black">{{ t("call.matched.title") }}</h2>
        <p class="text-subtitle text-lg">{{ t("call.matched.text") }}</p>

        <div
          class="text-primary bg-primary/5 active:bg-primary/10 flex cursor-pointer items-center justify-center gap-3 rounded-3xl p-6 text-2xl font-black tracking-wider transition-all active:scale-95"
          @click="handleCopy"
        >
          @anonymous_crush
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 pt-8">
      <UButton size="xl" block class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl">
        {{ t("call.matched.button") }}
      </UButton>

      <UButton
        size="xl"
        block
        variant="ghost"
        color="neutral"
        class="text-subtitle rounded-full py-6 text-lg font-bold"
        :to="localePath('/')"
      >
        {{ t("call.matched.exit") }}
      </UButton>
    </div>
  </div>
</template>
