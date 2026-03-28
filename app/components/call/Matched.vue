<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const { showToast } = useCustomToast();

const props = defineProps<{
  username?: string | null;
  photoUrl?: string | null;
}>();

const formattedUsername = computed(() => {
  if (!props.username) return "anonymous";
  return props.username.startsWith("@") ? props.username : `@${props.username}`;
});

const handleCopy = () => {
  navigator.clipboard.writeText(formattedUsername.value);
  showToast(t("call.matched.copied"), "success");
};

const telegramUrl = computed(() => {
  const pureUsername = props.username?.replace("@", "") || "";
  return `https://t.me/${pureUsername}`;
});
</script>

<template>
  <div class="flex grow flex-col">
    <div class="flex grow flex-col items-center justify-center space-y-8 px-4 text-center">
      <div class="bg-primary/10 flex aspect-square w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white/10 shadow-lg">
        <template v-if="props.photoUrl">
          <img :src="props.photoUrl" class="h-full w-full object-cover" />
        </template>
        <template v-else>
          <UIcon name="mdi:checkbox-marked-circle-outline" class="text-primary h-24 w-24 text-5xl opacity-50" />
        </template>
      </div>
      <div class="space-y-4">
        <h2 class="text-title text-3xl font-black">{{ t("call.matched.title") }}</h2>
        <p class="text-subtitle text-lg">{{ t("call.matched.text") }}</p>

        <div
          class="text-primary bg-primary/5 active:bg-primary/10 flex cursor-pointer items-center justify-center gap-3 rounded-3xl p-6 text-2xl font-black tracking-wider transition-all active:scale-95"
          @click="handleCopy"
        >
          {{ formattedUsername }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 pt-8">
      <UButton
        size="xl"
        block
        class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl"
        :to="telegramUrl"
        target="_blank"
      >
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
