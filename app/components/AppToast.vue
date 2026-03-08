<script setup lang="ts">
import { useCustomToast } from "~/composables/useCustomToast";

const { isVisible, message, type } = useCustomToast();
</script>

<template>
  <Transition name="slide-down">
    <div v-if="isVisible" class="fixed top-0 right-0 left-0 z-10001">
      <div
        :class="{
          'bg-primary text-background': type === 'success',
          'text-background bg-blue-500': type === 'info',
          'bg-error text-background': type === 'error',
        }"
        class="flex items-center gap-3 overflow-hidden px-4 py-1 text-center"
      >
        <div class="text-md grow font-bold tracking-wide text-white">
          {{ message }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
