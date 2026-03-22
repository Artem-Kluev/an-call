import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWakeLock } from './useWakeLock'

export type CallState = "searching" | "active" | "decision" | "waiting" | "matched" | "rejected" | "disconnected";

export const useVoiceRoulette = () => {
  const state = ref<CallState>("searching")
  const partnerDecision = ref<string | null | undefined>(undefined)
  const myDecision = ref<boolean | null>(null)
  const user = useSupabaseUser()
  
  const { startSearch, stopMatchmaking, matchResult} = useMatchmaking()
  const liveKit = useLiveKit()
  const { metadata } = useUserMetadata()
  const localePath = useLocalePath()
  const router = useRouter()
  const wakeLock = useWakeLock()
  const userId = user.value?.sub
  
  // Перевірка чи партнер все ще в кімнаті кожні 3 сек
  let connectionCheckInterval: any = null

  const startConnectionCheck = () => {
    if (connectionCheckInterval) clearInterval(connectionCheckInterval)
    connectionCheckInterval = setInterval(() => {
      if (['active', 'decision', 'waiting'].includes(state.value)) {
        if (liveKit.room.remoteParticipants.size === 0 && liveKit.isConnected.value) {
          console.warn("No partner found in room, moving to disconnected state")
          state.value = 'disconnected'
          liveKit.leave()
          stopConnectionCheck()
        }
      } else {
        stopConnectionCheck()
      }
    }, 3000)
  }

  const stopConnectionCheck = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
    }
  }

  watch(state, (newState) => {
    if (['active', 'decision', 'waiting'].includes(newState)) {
      startConnectionCheck()
    } else {
      stopConnectionCheck()
    }
  })

  onUnmounted(stopConnectionCheck)

  // Коли знаходимо пару - одразу переходимо в active і підключаємося до LiveKit
  watch(matchResult, async (result) => {
    if (result?.room_name && state.value === "searching") {
      state.value = "active"
      try {
        await liveKit.join(result.room_name)
        // Відправляємо свій ID партнеру
        await liveKit.sendMessage({ type: 'hello', id: userId })
      } catch (e) {
        console.error("Failed to join LiveKit room", e)
        state.value = "searching" // Повертаємося до пошуку
      }
    }
  })

  // Коли партнер підключається до вже існуючої кімнати
  liveKit.onPartnerJoin(() => {
    liveKit.sendMessage({ type: 'hello', id: userId })
  })

  // Слухаємо повідомлення з Data Channel LiveKit
  liveKit.onMessage((data) => {
    console.log("Received message:", data)

    if (data.type === 'hello' && data.id) {
      useCallHistory().addToHistory(data.id)
    }

    if (data.type === 'decision') {
      partnerDecision.value = data.liked
      checkFinalResult()
    } 
    
    if (data.type === 'end') {
      endCall(false)
    }
  })

  // Якщо парнер скинув слухавку
  liveKit.onPartnerLeave(() => {
    if (state.value === 'decision' || state.value === 'waiting') {
      // Якщо партнер відключився до свого рішення - вважаємо це відмовою
      partnerDecision.value = null
      checkFinalResult()

      return
    }

    state.value = 'disconnected'
    liveKit.leave()
  })

  const checkFinalResult = () => {
    // Якщо обидва зробили вибір
    if (myDecision.value !== null && partnerDecision.value !== undefined) {
      if (myDecision.value && partnerDecision.value !== null) {
        state.value = "matched"
      } else {
        state.value = "rejected"
      }

      // liveKit.leave()
    } else if (myDecision.value !== null && partnerDecision.value === undefined) {
      state.value = "waiting"
    }
  }

  const beginSearch = async () => {
    state.value = "searching"
    matchResult.value = null
    myDecision.value = null
    partnerDecision.value = undefined
    
    // Переконуємось що ми вийшли з попередньої кімнати
    await liveKit.leave()

    const profile = {
      gender: metadata.value.gender || "male",
      search_for: metadata.value.seeking || "female",
      city: metadata.value.city || "Київ",
      age: metadata.value.age || 18
    }

    console.log("useVoiceRoulette: beginning search with profile:", profile)
    await wakeLock.requestWakeLock()
    await startSearch(profile)
  }

  const cancelSearch = async () => {
    await stopMatchmaking()
    await wakeLock.releaseWakeLock()
    router.push(localePath("/"))
  }

  const endCall = (sendMessage: boolean = true) => {
    state.value = "decision"
    liveKit.setMicrophoneEnabled(false)

    if (sendMessage) {
      liveKit.sendMessage({ type: 'end' })
    }
  }

  const makeDecision = async (liked: boolean) => {
    myDecision.value = liked
    
    // Відправляємо наш вибір співрозмовнику через LiveKit
    const nickname = metadata.value.username || "anonymous"
    await liveKit.sendMessage({ type: 'decision', liked: liked ? nickname : null })

    await stopMatchmaking()
    
    if(!liked){
      router.push(localePath("/"))
    }else{
      checkFinalResult()
    }
    
    if(!liked) {
      await wakeLock.releaseWakeLock()
    }
  }

  const cancelWaiting = async () => {
    state.value = "rejected"
    await liveKit.leave()
    await stopMatchmaking()
    await wakeLock.releaseWakeLock()
  }

  const resetFlow = async () => {
    await wakeLock.releaseWakeLock()
    await beginSearch()
  }

  return {
    state,
    partnerDecision,
    beginSearch,
    cancelSearch,
    endCall,
    makeDecision,
    cancelWaiting,
    resetFlow
  }
}
