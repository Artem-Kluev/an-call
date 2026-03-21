<script setup lang="ts">
import { ukraineCities } from "~/utils/ukraineCities";
const { t } = useI18n();
const localePath = useLocalePath();

const { metadata, updateMetadata } = useUserMetadata();
const isSubmitting = ref(false);

const form = ref({
  age: 18,
  city: "Київ",
  gender: "",
  seeking: "",
  is18: false,
});

// Sync form with metadata when it becomes available
watch(metadata, (newMeta) => {
  if (newMeta && Object.keys(newMeta).length > 0) {
    if (newMeta.age) form.value.age = newMeta.age;
    if (newMeta.city) form.value.city = newMeta.city;
    if (newMeta.gender) form.value.gender = newMeta.gender;
    if (newMeta.seeking) form.value.seeking = newMeta.seeking;
  }
}, { immediate: true });

const genders = [
  { value: "male", label: t("onboarding.fields.gender.male"), icon: "tabler:man" },
  { value: "female", label: t("onboarding.fields.gender.female"), icon: "streamline-plump:toilet-sign-man" },
];

const seekingOptions = [
  { value: "male", label: t("onboarding.fields.seeking.male"), icon: "tabler:gender-male" },
  { value: "female", label: t("onboarding.fields.seeking.female"), icon: "mdi:gender-female" },
];

const isFormValid = computed(() => {
  return form.value.age >= 18 && form.value.city && form.value.gender && form.value.seeking && form.value.is18;
});

const onSubmit = async () => {
  if (isFormValid.value) {
    isSubmitting.value = true;
    const { error } = await updateMetadata({
      age: form.value.age,
      city: form.value.city,
      gender: form.value.gender,
      seeking: form.value.seeking
    });
    isSubmitting.value = false;
    
    if (!error) {
      navigateTo(localePath("/"));
    } else {
      console.error("Failed to update metadata", error);
    }
  }
};
</script>

<template>
  <UContainer class="flex min-h-screen max-w-md flex-col gap-8 py-8">
    <!-- Header -->
    <div class="space-y-4 text-center">
      <h1 class="text-primary text-3xl font-black">
        {{ t("onboarding.title") }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ t("onboarding.subtitle") }}
      </p>
    </div>

    <!-- Form -->
    <div class="grow space-y-10">
      <!-- Age Slider -->
      <UFormField :label="t('onboarding.fields.age.label')" size="lg">
        <div class="space-y-4">
          <div
            class="mb-5 flex items-center justify-between rounded-2xl border border-gray-300 bg-white p-2"
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

      <!-- 18+ Checkbox -->
      <UCheckbox
        v-model="form.is18"
        :label="t('onboarding.fields.confirmation.age_18')"
        size="lg"
        class="rounded-2xl border border-gray-100 bg-gray-50 p-4"
      />
    </div>

    <!-- CTA -->
    <div class="mt-auto">
      <UButton size="xl" block :disabled="!isFormValid" :loading="isSubmitting" class="rounded-2xl py-5 text-lg font-bold" @click="onSubmit">
        {{ t("onboarding.button") }}
      </UButton>
    </div>
  </UContainer>
</template>

<style scoped></style>
