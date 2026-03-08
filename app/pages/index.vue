<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col px-6 pt-12 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-primary h-2 w-2 rounded-full"></div>
        <span class="text-title text-sm font-bold tracking-[0.2em] uppercase">AnonMatch</span>
      </div>
      <NuxtLink to="/setting" class="transition-transform active:scale-90">
        <UIcon name="i-heroicons-bars-2" class="text-title h-6 w-6" />
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <div class="flex grow flex-col items-center justify-center space-y-12">
      <!-- Minimal Hero -->
      <div class="space-y-6 text-center">
        <div class="space-y-2">
          <h1 class="text-title text-5xl leading-tight font-black tracking-tighter sm:text-6xl">
            {{ t("home.title") }}
          </h1>
          <p class="text-subtitle mx-auto max-w-[260px] text-lg font-medium opacity-80">
            {{ t("home.subtitle") }}
          </p>
        </div>

        <!-- Subtle Location -->
        <div class="text-primary flex items-center justify-center gap-2">
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
          <span class="text-xs font-bold tracking-widest uppercase">{{ t("home.location") }}</span>
        </div>
      </div>

      <!-- Action -->
      <div class="w-full max-w-xs pt-8">
        <NuxtLink to="/call" class="group relative block">
          <!-- Soft glow background -->
          <div
            class="bg-primary/20 group-hover:bg-primary/30 absolute -inset-4 rounded-[3rem] blur-2xl transition-all duration-500"
          ></div>

          <!-- Liquid-like button -->
          <div
            class="bg-primary group-hover:shadow-primary/40 relative flex h-24 w-full items-center justify-center overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-300 active:scale-95"
          >
            <span class="relative z-10 text-xl font-black tracking-wide text-white">
              {{ t("call.idle.start") }}
            </span>
            <!-- Subtle internal glow -->
            <div class="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/20"></div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Footer Stats (Minimal) -->
    <div class="mt-auto flex justify-center pt-8">
      <p class="text-subtitle flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-40">
        <span class="bg-success h-1.5 w-1.5 rounded-full"></span>
        1,280 Online
      </p>
    </div>
  </div>
</template>

<style scoped>
.bg-background {
  background-color: var(--color-background);
}
.text-title {
  color: var(--color-title);
}
.text-subtitle {
  color: var(--color-subtitle);
}
</style>
