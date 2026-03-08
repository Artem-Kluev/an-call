<script setup lang="ts">
import { ukraineCities } from "~/utils/ukraineCities";
const { t, locale, locales, setLocale } = useI18n();
const localePath = useLocalePath();
const colorMode = useColorMode();

const form = ref({
  age: 18,
  city: "Київ",
  gender: "",
  seeking: "",
  is18: false,
});

const genders = [
  { value: "male", label: t("onboarding.fields.gender.male"), icon: "tabler:man" },
  { value: "female", label: t("onboarding.fields.gender.female"), icon: "streamline-plump:toilet-sign-man " },
];

const seekingOptions = [
  { value: "male", label: t("onboarding.fields.seeking.male"), icon: "tabler:gender-male" },
  { value: "female", label: t("onboarding.fields.seeking.female"), icon: "mdi:gender-female" },
];

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const currentLocaleName = computed(() => {
  return locales.value.find((l) => l.code === locale.value)?.name || locale.value;
});
</script>

<template>
  <UContainer class="flex min-h-screen max-w-md flex-col gap-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <NuxtLink
        :to="localePath('/')"
        class="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 transition-all hover:bg-gray-100 active:scale-90 dark:border-gray-800 dark:bg-gray-800/50"
      >
        <UIcon name="i-heroicons-chevron-left" class="h-6 w-6" />
      </NuxtLink>
      <h1 class="text-xl font-black">{{ t("settings.title") }}</h1>
      <div class="w-12"></div>
    </div>

    <!-- Settings Sections -->
    <div class="flex-grow space-y-10">
      <!-- Language & Theme -->
      <div class="space-y-4">
        <div class="flex gap-3">
          <!-- Language Select -->
          <div class="flex-1">
            <USelectMenu
              v-model="locale"
              :items="locales"
              value-attribute="code"
              option-attribute="name"
              class="w-full rounded-2xl py-2"
              size="lg"
              @update:model-value="setLocale"
            >
              <template #leading>
                <UIcon name="i-heroicons-language" class="h-5 w-5 opacity-50" />
              </template>
            </USelectMenu>
          </div>

          <!-- Theme Toggle -->
          <UButton color="neutral" variant="outline" size="lg" class="rounded-2xl px-5" @click="toggleTheme">
            <UIcon :name="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'" class="h-5 w-5" />
          </UButton>
        </div>
      </div>

      <UDivider />

      <!-- Profile Form (Existing) -->
      <div class="space-y-8 opacity-80">
        <div class="space-y-4">
          <div
            class="mb-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
          >
            <span class="text-primary text-2xl font-bold">{{ form.age }}</span>
            <span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">роки</span>
          </div>
          <USlider v-model="form.age" :min="18" :max="60" size="lg" color="primary" />
        </div>

        <USelectMenu
          v-model="form.city"
          :items="ukraineCities"
          :placeholder="t('onboarding.fields.city.placeholder')"
          class="w-full rounded-2xl py-3"
          size="xl"
          searchable
          :search-attributes="['label']"
        />

        <div class="flex gap-3">
          <UButton
            v-for="gender in genders"
            :key="gender.value"
            :variant="form.gender === gender.value ? 'solid' : 'outline'"
            :color="form.gender === gender.value ? 'primary' : 'neutral'"
            class="flex flex-1 items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300"
            @click="form.gender = gender.value"
          >
            <div class="flex items-center gap-4">
              <UIcon :name="gender.icon" class="h-6 w-6 text-2xl" />
              <span class="text-base font-semibold">{{ gender.label }}</span>
            </div>
          </UButton>
        </div>

        <div class="flex gap-3">
          <UButton
            v-for="option in seekingOptions"
            :key="option.value"
            :variant="form.seeking === option.value ? 'solid' : 'outline'"
            :color="form.seeking === option.value ? 'primary' : 'neutral'"
            class="flex flex-1 items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300"
            @click="form.seeking = option.value"
          >
            <div class="flex items-center gap-4">
              <UIcon :name="option.icon" class="h-6 w-6 text-2xl" />
              <span class="text-base font-semibold">{{ option.label }}</span>
            </div>
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<style scoped></style>
