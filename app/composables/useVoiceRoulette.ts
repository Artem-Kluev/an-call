import { ref, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useWakeLock } from "./useWakeLock";

export type CallState = "searching" | "active" | "decision" | "waiting" | "matched" | "rejected" | "disconnected";

export const useVoiceRoulette = () => {
  const state = ref<CallState>("searching");
  const partnerDecision = ref<string | null | undefined>(undefined);
  const partnerPhoto = ref<string | null>(null);
  const myDecision = ref<boolean | null>(null);
  const user = useSupabaseUser();

  const { startSearch, stopMatchmaking, matchResult } = useMatchmaking();
  const liveKit = useLiveKit();
  const { tgUser } = useTelegramData();
  const { metadata } = useUserMetadata();
  const localePath = useLocalePath();
  const router = useRouter();
  const wakeLock = useWakeLock();
  const supabase = useSupabaseClient();
  const userId = user.value?.sub;
  let sendEndInterval: NodeJS.Timeout | null = null;

  // Statistics tracking
  const searchStartTime = ref<number | null>(null);
  const callStartTime = ref<number | null>(null);
  const partnerId = ref<string | null>(null);
  const hasLogged = ref(false);

  // Коли знаходимо пару - одразу переходимо в active і підключаємося до LiveKit
  watch(matchResult, async (result) => {
    if (result?.room_name && state.value === "searching") {
      state.value = "active";
      callStartTime.value = Date.now();
      try {
        await liveKit.join(result.room_name);
        // Відправляємо свій ID партнеру
        await liveKit.sendMessage({ type: "hello", id: userId });
      } catch (e) {
        console.error("Failed to join LiveKit room", e);
        state.value = "searching"; // Повертаємося до пошуку
        callStartTime.value = null;
      }
    }
  });

  let intervalHasPartner: any;
  if (import.meta.client) {
    intervalHasPartner = setInterval(() => {
      const hasPartner = !!liveKit.room?.remoteParticipants?.size;

      if (!hasPartner && liveKit.isConnected.value) {
        console.log("No partner found", !hasPartner, liveKit.isConnected.value);
        checkHasPartner();
      }
    }, 300);
  }

  function checkHasPartner() {
    setTimeout(() => {
      const hasPartner = !!liveKit.room?.remoteParticipants?.size;

      if (!hasPartner && liveKit.isConnected.value) {
        disconnect();
      }
    }, 3000);
  }
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
      partnerId.value = data.id;
      useCallHistory().addToHistory(data.id);
    }

    if (data.type === "decision") {
      if (data.liked && typeof data.liked === "object") {
        partnerDecision.value = data.liked.username;
        partnerPhoto.value = data.liked.photo_url;
      } else {
        partnerDecision.value = data.liked;
        partnerPhoto.value = null;
      }
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
      if (partnerDecision.value === undefined) {
        partnerDecision.value = null;
      }

      checkFinalResult();

      return;
    }

    state.value = "disconnected";
    liveKit.leave();
  }

  const checkFinalResult = () => {
    if (myDecision.value === null) return;

    if (partnerDecision.value === undefined) {
      state.value = "waiting";
      return;
    }

    const isMutualMatch = myDecision.value && partnerDecision.value !== null;
    state.value = isMutualMatch ? "matched" : "rejected";
  };

  const beginSearch = async () => {
    state.value = "searching";
    matchResult.value = null;
    myDecision.value = null;
    partnerDecision.value = undefined;
    searchStartTime.value = Date.now();
    callStartTime.value = null;
    partnerId.value = null;
    hasLogged.value = false;

    const profile = {
      gender: metadata.value.gender || "male",
      search_for: metadata.value.seeking || (metadata.value.gender === "male" ? "female" : "male"),
      city: metadata.value.city || "Kyiv",
      age: metadata.value.age || 18,
    };

    await wakeLock.requestWakeLock();
    await startSearch(profile);
  };

  const cancelSearch = async () => {
    await saveMatchStats();
    await stopMatchmaking();
    await wakeLock.releaseWakeLock();
    router.push(localePath("/"));
  };

  const saveMatchStats = async () => {
    if (hasLogged.value || !searchStartTime.value || !userId) return;

    const now = Date.now();
    const waitDuration = Math.floor(((callStartTime.value || now) - searchStartTime.value) / 1000);
    const callDuration = callStartTime.value ? Math.floor((now - callStartTime.value) / 1000) : 0;

    const stats = {
      user_id: userId,
      user_nickname: tgUser.value?.username || "anonymous",
      user_gender: metadata.value.gender || "male",
      seeking_gender: metadata.value.seeking || "female",
      city: metadata.value.city || "Kyiv",
      age: metadata.value.age || 18,
      wait_duration: waitDuration,
      call_duration: callDuration,
      is_connected: !!callStartTime.value,
      user_liked: myDecision.value === true,
      is_mutual: state.value === "matched",
      partner_id: partnerId.value,
    };

    try {
      const { error } = await supabase.from("match_history" as any).insert(stats as any);
      if (error) throw error;
      hasLogged.value = true;
      console.log("Match history saved successfully", stats);
    } catch (e) {
      console.error("Failed to save match history:", e);
    }
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
    const nickname = tgUser.value?.username || "anonymous";
    const photoUrl = tgUser.value?.photo_url || null;

    const likedData = liked
      ? {
          username: nickname,
          photo_url: photoUrl,
        }
      : null;

    await liveKit.sendMessage({ type: "decision", liked: likedData });

    if (liked) {
      checkFinalResult();
    }

    await stopMatchmaking();

    if (!liked) {
      await saveMatchStats();
      router.push(localePath("/"));
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
    // await liveKit.leave();
    // await stopMatchmaking();
    // await wakeLock.releaseWakeLock();
    router.push(localePath("/"));
  };

  const resetFlow = async () => {
    await wakeLock.releaseWakeLock();
    await beginSearch();
  };

  watch(state, (newState) => {
    if (newState === "matched" || newState === "rejected" || newState === "disconnected") {
      saveMatchStats();
    }
  });

  return {
    state,
    partnerDecision,
    partnerPhoto,
    beginSearch,
    cancelSearch,
    endCall,
    makeDecision,
    cancelWaiting,
    resetFlow,
  };
};
