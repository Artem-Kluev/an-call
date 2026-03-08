<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <UContainer class="flex min-h-screen max-w-md flex-col gap-8 py-10">
    <!-- Header -->
    <div class="flex items-center justify-end">
      <NuxtLink to="/setting" class="transition-transform active:scale-90">
        <UIcon name="material-symbols:settings-account-box-outline-rounded" class="text-title h-6 w-6 text-4xl" />
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <div class="flex grow flex-col items-center justify-between space-y-8">
      <div class="mt-12 flex flex-col items-center space-y-8">
        <div class="bg-primary/10 rounded-full p-8">
          <UIcon name="fa7-solid:user-friends" class="text-primary h-24 w-24 text-7xl" />
        </div>

        <!-- Minimal Hero -->
        <div class="space-y-6 text-center">
          <div class="space-y-8">
            <h1 class="text-title text-3xl leading-tight font-black tracking-tighter">
              {{ t("home.title") }}
            </h1>
            <p class="text-subtitle mx-auto max-w-[260px] text-lg font-medium opacity-80">
              {{ t("home.subtitle") }}
            </p>
          </div>

          <!-- Subtle Location -->
          <div class="text-primary flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-xl" />
            <span class="text-lg font-bold tracking-widest uppercase">{{ t("home.location") }}</span>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="w-full pt-3">
        <UButton to="/call" size="xl" block class="shadow-primary/20 rounded-full py-6 text-lg font-bold shadow-xl">
          {{ t("call.idle.start") }}
        </UButton>
      </div>
    </div>

    <!-- Footer Stats (Minimal) -->
    <!-- <div class="mt-auto flex justify-center pt-8">
      <p class="text-subtitle flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-40">
        <span class="bg-success h-1.5 w-1.5 rounded-full"></span>
        1,280 Online
      </p>
    </div> -->
  </UContainer>
</template>
