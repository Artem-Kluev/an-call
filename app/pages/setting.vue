<script setup lang="ts">
import { ukraineCities } from "~/utils/ukraineCities";
const { t, locale, locales, setLocale } = useI18n();
const localePath = useLocalePath();
const colorMode = useColorMode();

const { metadata, updateMetadata } = useUserMetadata();

const form = ref({
  age: metadata.value.age || 18,
  city: metadata.value.city || "Kyiv",
  gender: metadata.value.gender || "",
  seeking: metadata.value.seeking || "",
  is18: false,
});

watch(
  () => metadata.value,
  (newMeta) => {
    if (newMeta && Object.keys(newMeta).length > 0) {
      // Only update if the form seems untouched to prevent sudden resets
      if (form.value.age === 18 && !form.value.gender && !form.value.seeking) {
        form.value.age = newMeta.age || form.value.age;
        form.value.city = newMeta.city || form.value.city;
        form.value.gender = newMeta.gender || form.value.gender;
        form.value.seeking = newMeta.seeking || form.value.seeking;
      }
    }
  },
  { immediate: true },
);

watchDebounced(
  form,
  async (newForm) => {
    await updateMetadata({
      age: newForm.age,
      city: newForm.city,
      gender: newForm.gender,
      seeking: newForm.seeking,
    });
  },
  { deep: true, debounce: 500, maxWait: 2000 },
);

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
const cityOptions = computed(() => {
  return ukraineCities.map((city) => ({
    label: (city as any)[locale.value] || city.en,
    value: city.en,
  }));
});

const selectedCity = computed({
  get: () =>
    cityOptions.value.find((c) => c.value === form.value.city) || cityOptions.value.find((c) => c.value === "Kyiv"),
  set: (val: any) => {
    if (val) form.value.city = val.value;
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
        <UIcon name="material-symbols:arrow-back-ios-new" class="text-xl" />
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
          class="w-full rounded-2xl py-4"
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

      <USeparator />

      <!-- Profile Form (Existing) -->
      <div class="space-y-8">
        <UFormField :label="t('onboarding.fields.age.label')" size="lg">
          <div class="space-y-4">
            <div
              class="mb-6 flex items-center justify-between rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-800 dark:bg-gray-800/50"
            >
              <span class="text-primary text-xl font-bold">{{ form.age }}</span>
              <span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">роки</span>
            </div>

            <USlider v-model="form.age" :min="18" :max="60" size="lg" color="primary" />
          </div>
        </UFormField>

        <UFormField :label="t('onboarding.fields.city.label')" size="lg">
          <USelectMenu
            v-model="selectedCity"
            :items="cityOptions"
            :placeholder="t('onboarding.fields.city.placeholder')"
            class="w-full rounded-2xl py-4"
            size="xl"
            searchable
          />
        </UFormField>

        <UFormField :label="t('onboarding.fields.gender.label')" size="lg">
          <div class="flex gap-4">
            <UButton
              v-for="gender in genders"
              :key="gender.value"
              :variant="form.gender === gender.value ? 'solid' : 'outline'"
              :color="form.gender === gender.value ? 'primary' : 'neutral'"
              class="flex flex-1 items-center justify-between rounded-2xl px-6 py-4 transition-all duration-300"
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
          <div class="flex gap-4">
            <UButton
              v-for="option in seekingOptions"
              :key="option.value"
              :variant="form.seeking === option.value ? 'solid' : 'outline'"
              :color="form.seeking === option.value ? 'primary' : 'neutral'"
              class="flex flex-1 items-center justify-between rounded-2xl px-6 py-4 transition-all duration-300"
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
