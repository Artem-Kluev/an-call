<script setup lang="ts">
import { onMounted } from "vue";
import CallSearching from "~/components/call/Searching.vue";
import CallActive from "~/components/call/Active.vue";
import CallDecision from "~/components/call/Decision.vue";
import CallWaiting from "~/components/call/Waiting.vue";
import CallMatched from "~/components/call/Matched.vue";
import CallRejected from "~/components/call/Rejected.vue";

const { 
  state, 
  beginSearch, 
  cancelSearch, 
  endCall, 
  makeDecision, 
  cancelWaiting, 
  resetFlow,
  skipPartner
} = useVoiceRoulette();

onMounted(() => {
  beginSearch();
});
</script>

<template>
  <UContainer class="bg-background relative flex min-h-screen max-w-md flex-col gap-8 py-10">
    <CallSearching v-if="state === 'searching'" @cancel="cancelSearch" />
    <CallActive v-else-if="state === 'active'" @end="endCall" @skip="skipPartner" />
    <CallDecision v-else-if="state === 'decision'" @choice="makeDecision" />
    <CallWaiting v-else-if="state === 'waiting'" @cancel="cancelWaiting" />
    <CallMatched v-else-if="state === 'matched'" @reset="resetFlow" />
    <CallRejected v-else-if="state === 'rejected'" @reset="resetFlow" />
  </UContainer>
</template>
