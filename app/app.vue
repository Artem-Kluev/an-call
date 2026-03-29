<script setup>
import { watch } from "vue";

const { initData } = useTelegramData();

const user = useSupabaseUser();
const { login } = useTelegramAuth();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();

const isLogin = await login(initData);

// Stable check for onboarding completion
const needsOnboarding = computed(() => {
  if (!user.value || !user.value.user_metadata) return true;
  const meta = user.value.user_metadata;

  return !(meta.age && meta.city && meta.gender && meta.seeking);
});

// Redirect logic that triggers only when the onboarding status changes
watch(
  [needsOnboarding, () => route.path],
  ([needs, currentPath]) => {
    if (!isLogin.success) return;

    // Check if we are already on the form page to avoid redirect loops
    const isFormRoute = currentPath.includes("form");

    if (needs && !isFormRoute) {
      router.push(localePath("/form"));
    }
  },
  { immediate: true },
);
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast />
  </UApp>
</template>
