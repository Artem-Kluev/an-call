import { ref, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useWakeLock } from "./useWakeLock";

export type CallState = "searching" | "active" | "decision" | "waiting" | "matched" | "rejected" | "disconnected";

export const useVoiceRoulette = () => {
  const state = ref<CallState>("searching");
  const partnerDecision = ref<string | null | undefined>(undefined);
  const myDecision = ref<boolean | null>(null);
  const user = useSupabaseUser();

  const { startSearch, stopMatchmaking, matchResult } = useMatchmaking();
  const liveKit = useLiveKit();
  const { metadata } = useUserMetadata();
  const localePath = useLocalePath();
  const router = useRouter();
  const wakeLock = useWakeLock();
  const userId = user.value?.sub;
  let sendEndInterval: NodeJS.Timeout | null = null;

  // Коли знаходимо пару - одразу переходимо в active і підключаємося до LiveKit
  watch(matchResult, async (result) => {
    if (result?.room_name && state.value === "searching") {
      state.value = "active";
      try {
        await liveKit.join(result.room_name);
        // Відправляємо свій ID партнеру
        await liveKit.sendMessage({ type: "hello", id: userId });
      } catch (e) {
        console.error("Failed to join LiveKit room", e);
        state.value = "searching"; // Повертаємося до пошуку
      }
    }
  });

  const intervalHasPartner = setInterval(() => {
    const hasPartner = !!liveKit.room?.remoteParticipants?.size;

    if (!hasPartner && liveKit.isConnected.value) {
      disconnect();
    }

    console.log("hasPartner", hasPartner);
  }, 1000);

  // Коли партнер підключається до вже існуючої кімнати
  liveKit.onPartnerJoin(() => {
    if (state.value === "active") {
      liveKit.sendMessage({ type: "hello", id: userId });

      return;
    }

    liveKit.sendMessage({ type: "error", message: "Partner not found" });
  });

  // Слухаємо повідомлення з Data Channel LiveKit
  liveKit.onMessage((data) => {
    // console.log("Received message:", data);

    if (data.type === "hello" && data.id) {
      useCallHistory().addToHistory(data.id);
    }

    if (data.type === "decision") {
      partnerDecision.value = data.liked;
      checkFinalResult();
    }

    if ((data.type === "end" || data.type === "error") && state.value === "active") {
      endCall(false);
    }
  });

  // Якщо парнер скинув слухавку
  liveKit.onPartnerLeave(() => {
    disconnect();
  });

  function disconnect() {
    if (state.value === "matched" || state.value === "rejected") return;

    if (state.value === "decision" || state.value === "waiting") {
      // Якщо партнер відключився до свого рішення - вважаємо це відмовою
      partnerDecision.value = null;
      checkFinalResult();

      return;
    }

    state.value = "disconnected";
    liveKit.leave();
  }

  const checkFinalResult = () => {
    // Якщо обидва зробили вибір
    if (myDecision.value !== null && partnerDecision.value !== undefined) {
      if (myDecision.value && partnerDecision.value !== null) {
        state.value = "matched";
      } else {
        state.value = "rejected";
      }

      // liveKit.leave()
    } else if (myDecision.value !== null && partnerDecision.value === undefined) {
      state.value = "waiting";
    }
  };

  const beginSearch = async () => {
    state.value = "searching";
    matchResult.value = null;
    myDecision.value = null;
    partnerDecision.value = undefined;

    // Переконуємось що ми вийшли з попередньої кімнати
    await liveKit.leave();

    const profile = {
      gender: metadata.value.gender || "male",
      search_for: metadata.value.seeking || "female",
      city: metadata.value.city || "Київ",
      age: metadata.value.age || 18,
    };

    await wakeLock.requestWakeLock();
    await startSearch(profile);
  };

  const cancelSearch = async () => {
    await stopMatchmaking();
    await wakeLock.releaseWakeLock();
    router.push(localePath("/"));
  };

  const endCall = (sendMessage: boolean = true) => {
    state.value = "decision";
    liveKit.setMicrophoneEnabled(false);

    if (sendMessage) {
      sendEndInterval = setInterval(() => {
        liveKit.sendMessage({ type: "end" });
        console.log("end");
      }, 1000);
    }
  };

  const makeDecision = async (liked: boolean) => {
    myDecision.value = liked;

    // Відправляємо наш вибір співрозмовнику через LiveKit
    const nickname = metadata.value.username || "anonymous";
    await liveKit.sendMessage({ type: "decision", liked: liked ? nickname : null });

    await stopMatchmaking();

    if (!liked) {
      router.push(localePath("/"));
    } else {
      checkFinalResult();
    }

    if (!liked) {
      await wakeLock.releaseWakeLock();
    }
  };

  onUnmounted(() => {
    clearInterval(intervalHasPartner);

    if (sendEndInterval) clearInterval(sendEndInterval);
  });

  const cancelWaiting = async () => {
    state.value = "rejected";
    await liveKit.leave();
    await stopMatchmaking();
    await wakeLock.releaseWakeLock();
  };

  const resetFlow = async () => {
    await wakeLock.releaseWakeLock();
    await beginSearch();
  };

  return {
    state,
    partnerDecision,
    beginSearch,
    cancelSearch,
    endCall,
    makeDecision,
    cancelWaiting,
    resetFlow,
  };
};
