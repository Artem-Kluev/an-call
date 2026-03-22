<script setup lang="ts">
import { onMounted } from "vue";
import CallSearching from "~/components/call/Searching.vue";
import CallActive from "~/components/call/Active.vue";
import CallDecision from "~/components/call/Decision.vue";
import CallWaiting from "~/components/call/Waiting.vue";
import CallMatched from "~/components/call/Matched.vue";
import CallRejected from "~/components/call/Rejected.vue";
import CallDisconnected from "~/components/call/Disconnected.vue";

const { 
  state, 
  partnerDecision,
  beginSearch, 
  cancelSearch, 
  endCall, 
  makeDecision, 
  cancelWaiting, 
  resetFlow
} = useVoiceRoulette();

onMounted(() => {
  beginSearch();
});
</script>

<template>
  <UContainer class="bg-gray-500 relative flex min-h-screen max-w-md flex-col gap-8 py-10">
    <CallSearching v-if="state === 'searching'" @cancel="cancelSearch" />
    <CallActive v-else-if="state === 'active'" @end="endCall" />
    <CallDecision v-else-if="state === 'decision'" @choice="makeDecision" />
    <CallWaiting v-else-if="state === 'waiting'" @cancel="cancelWaiting" />
    <CallMatched v-else-if="state === 'matched'" :username="partnerDecision" @reset="resetFlow" />
    <CallRejected v-else-if="state === 'rejected'" @reset="resetFlow" />
    <CallDisconnected v-else-if="state === 'disconnected'" @reset="resetFlow" />
  </UContainer>
</template>
