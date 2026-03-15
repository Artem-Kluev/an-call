<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import CallSearching from "~/components/call/Searching.vue";
import CallActive from "~/components/call/Active.vue";
import CallDecision from "~/components/call/Decision.vue";
import CallWaiting from "~/components/call/Waiting.vue";
import CallMatched from "~/components/call/Matched.vue";
import CallRejected from "~/components/call/Rejected.vue";

const localePath = useLocalePath();

type CallState = "searching" | "active" | "decision" | "waiting" | "matched" | "rejected";

const state = ref<CallState>("searching");
let waitingTimeout: any = null;

const cancelSearch = () => {
  navigateTo(localePath("/"));
};

const startCall = () => {
  state.value = "active";
};

const endCall = () => {
  state.value = "decision";
};

const handleDecision = (liked: boolean) => {
  if (liked) {
    state.value = "waiting";
    // Simulate partner also liking after a short delay (2 seconds)
    waitingTimeout = setTimeout(() => {
      // 80% chance for a match in this simulation
      if (Math.random() > 0.2) {
        state.value = "matched";
      } else {
        state.value = "rejected";
      }
    }, 2000);
  } else {
    state.value = "rejected";
  }
};

const cancelWaiting = () => {
  if (waitingTimeout) {
    clearTimeout(waitingTimeout);
    waitingTimeout = null;
  }
  navigateTo(localePath("/"));
};

const reset = () => {
  state.value = "searching";
};

onUnmounted(() => {
  if (waitingTimeout) clearTimeout(waitingTimeout);
});
</script>

<template>
  <UContainer class="bg-background relative flex min-h-screen max-w-md flex-col gap-8 py-10">
    <CallSearching v-if="state === 'searching'" @cancel="cancelSearch" @matched="startCall" />
    <CallActive v-else-if="state === 'active'" @end="endCall" />
    <CallDecision v-else-if="state === 'decision'" @choice="handleDecision" />
    <CallWaiting v-else-if="state === 'waiting'" @cancel="cancelWaiting" />
    <CallMatched v-else-if="state === 'matched'" @reset="reset" />
    <CallRejected v-else-if="state === 'rejected'" @reset="reset" />
  </UContainer>
</template>
