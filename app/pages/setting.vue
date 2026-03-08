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
  { value: "female", label: t("onboarding.fields.gender.female"), icon: "streamline-plump:toilet-sign-man" },
];

const seekingOptions = [
  { value: "male", label: t("onboarding.fields.seeking.male"), icon: "tabler:gender-male" },
  { value: "female", label: t("onboarding.fields.seeking.female"), icon: "mdi:gender-female" },
];

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const currentLocaleName = computed(() => {
  return locales.value.find((l) => l.code === locale.value)?.label || locale.value;
});

const selectedLocale = computed({
  get: () => locales.value.find((l) => l.code === locale.value) || locales.value[0],
  set: (val) => {
    if (val && typeof val === "object" && "code" in val) {
      setLocale(val.code as "uk" | "ru" | "en");
    }
  },
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
    <div class="grow">
      <UFormField :label="t('settings.language.label')" class="mt-2 mb-4" size="lg">
        <USelectMenu
          v-model="selectedLocale"
          :items="locales"
          :search-input="false"
          class="w-full rounded-2xl py-3"
          size="lg"
        >
          <template #leading>
            <UIcon v-if="selectedLocale?.icon" :name="selectedLocale.icon" class="h-5 w-5" />
            <UIcon v-else name="i-heroicons-language" class="h-5 w-5 opacity-50" />
          </template>

          <template #item="{ item }">
            <UIcon v-if="item.icon" :name="item.icon" class="h-5 w-5" />
            <span class="truncate">{{ item.label }}</span>
          </template>
        </USelectMenu>
      </UFormField>

      <UDivider />

      <!-- Profile Form (Existing) -->
      <div class="space-y-8">
        <UFormField :label="t('onboarding.fields.age.label')" size="lg">
          <div class="space-y-4">
            <div
              class="mb-5 flex items-center justify-between rounded-2xl border border-gray-300 bg-white p-2 dark:border-gray-800 dark:bg-gray-800/50"
            >
              <span class="text-primary text-xl font-bold">{{ form.age }}</span>
              <span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">роки</span>
            </div>

            <USlider v-model="form.age" :min="18" :max="60" size="lg" color="primary" />
          </div>
        </UFormField>

        <UFormField :label="t('onboarding.fields.city.label')" size="lg">
          <USelectMenu
            v-model="form.city"
            :items="ukraineCities"
            :placeholder="t('onboarding.fields.city.placeholder')"
            class="w-full rounded-2xl py-3"
            size="xl"
            searchable
            :search-attributes="['label']"
          />
        </UFormField>

        <UFormField :label="t('onboarding.fields.gender.label')" size="lg">
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
        </UFormField>

        <UFormField :label="t('onboarding.fields.seeking.label')" size="lg">
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
        </UFormField>
      </div>
    </div>
  </UContainer>
</template>

<style scoped></style>
