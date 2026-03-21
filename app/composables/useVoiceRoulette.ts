import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

export type CallState = "searching" | "active" | "decision" | "waiting" | "matched" | "rejected";

export const useVoiceRoulette = () => {
  const state = ref<CallState>("searching")
  const partnerDecision = ref<boolean | null>(null)
  const myDecision = ref<boolean | null>(null)
  
  const { startSearch, stopMatchmaking, matchResult } = useMatchmaking()
  const liveKit = useLiveKit()
  const { metadata } = useUserMetadata()
  const localePath = useLocalePath()
  const router = useRouter()

  // Коли знаходимо пару - одразу переходимо в active і підключаємося до LiveKit
  watch(matchResult, async (result) => {
    if (result?.room_name && state.value === "searching") {
      state.value = "active"
      try {
        await liveKit.join(result.room_name)
      } catch (e) {
        console.error("Failed to join LiveKit room", e)
        state.value = "searching" // Повертаємося до пошуку
      }
    }
  })

  // Слухаємо повідомлення з Data Channel LiveKit
  liveKit.onMessage((data) => {
    if (data.type === 'decision') {
      partnerDecision.value = data.liked
      checkFinalResult()
    }
  })

  // Якщо парнер скинув слухавку
  liveKit.onPartnerLeave(() => {
    if (state.value === 'active') {
      endCall()
    } else if (state.value === 'decision' || state.value === 'waiting') {
      // Якщо партнер відключився до свого рішення - вважаємо це відмовою
      partnerDecision.value = false
      checkFinalResult()
    }
  })

  const checkFinalResult = () => {
    // Якщо обидва зробили вибір
    if (myDecision.value !== null && partnerDecision.value !== null) {
      if (myDecision.value && partnerDecision.value) {
        state.value = "matched"
      } else {
        state.value = "rejected"
      }
      liveKit.leave()
    } else if (myDecision.value !== null && partnerDecision.value === null) {
      state.value = "waiting"
    }
  }

  const beginSearch = async () => {
    state.value = "searching"
    matchResult.value = null
    myDecision.value = null
    partnerDecision.value = null
    
    // Переконуємось що ми вийшли з попередньої кімнати
    await liveKit.leave()

    const profile = {
      gender: metadata.value.gender || "male",
      search_for: metadata.value.seeking || "female",
      city: metadata.value.city || "Київ",
      age: metadata.value.age || 18
    }

    await startSearch(profile)
  }

  const cancelSearch = async () => {
    await stopMatchmaking()
    router.push(localePath("/"))
  }

  const endCall = () => {
    state.value = "decision"
  }

  const makeDecision = async (liked: boolean) => {
    myDecision.value = liked
    
    // Відправляємо наш вибір співрозмовнику через LiveKit
    await liveKit.sendMessage({ type: 'decision', liked })
    checkFinalResult()
    
    // Видаляємо себе з черги
    await stopMatchmaking()
  }

  const cancelWaiting = () => {
    state.value = "rejected"
    liveKit.leave()
    stopMatchmaking()
  }

  const skipPartner = async () => {
    await liveKit.leave()
    await stopMatchmaking()
    await beginSearch()
  }

  const resetFlow = async () => {
    await beginSearch()
  }

  return {
    state,
    beginSearch,
    cancelSearch,
    endCall,
    makeDecision,
    cancelWaiting,
    resetFlow,
    skipPartner
  }
}
