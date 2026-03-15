import { ref, onUnmounted } from 'vue'
import { 
  Room, 
  RoomEvent, 
  Track, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack 
} from 'livekit-client'

export const useLiveKit = () => {
  const config = useRuntimeConfig()
  const room = new Room()
  
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const participants = ref<RemoteParticipant[]>([])
  const audioTracks = new Map<string, HTMLAudioElement>()

  // Обробка підписки на треки (звук співрозмовника)
  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
    if (track.kind === Track.Kind.Audio) {
      const element = track.attach()
      document.body.appendChild(element)
      audioTracks.set(track.sid, element)
    }
  })

  // Обробка відписки (коли юзер виходить)
  room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
    const element = audioTracks.get(track.sid)
    if (element) {
      element.remove()
      audioTracks.delete(track.sid)
    }
  })

  // Оновлення списку учасників
  const updateParticipants = () => {
    participants.value = Array.from(room.participants.values())
  }

  room.on(RoomEvent.ParticipantConnected, updateParticipants)
  room.on(RoomEvent.ParticipantDisconnected, updateParticipants)

  /**
   * Універсальна функція для входу в кімнату.
   * У LiveKit немає різниці між "створити" і "приєднатися" на клієнті:
   * Якщо кімнати не існує — вона створиться автоматично при першому вході.
   */
  const join = async (roomName: string, userSub: string) => {
    if (isConnecting.value || isConnected.value) return

    isConnecting.value = true
    try {
      // 1. Отримуємо токен через наш Nitro API
      const { token } = await $fetch('/api/livekit/token', {
        params: { room: roomName, identity: userSub }
      })

      // 2. Підключаємося до сервера
      await room.connect(config.public.livekitUrl, token)
      
      // 3. Публікуємо свій мікрофон
      await room.localParticipant.enableCameraAndMicrophone()
      
      isConnected.value = true
      updateParticipants()
      console.log(`Успішно приєднано до кімнати: ${roomName}`)
    } catch (error) {
      console.error('LiveKit connection error:', error)
      throw error
    } finally {
      isConnecting.value = false
    }
  }

  const leave = async () => {
    await room.disconnect()
    isConnected.value = false
    participants.value = []
    // Видаляємо всі аудіо елементи з DOM
    audioTracks.forEach(el => el.remove())
    audioTracks.clear()
  }

  // Автоматичне відключення при знищенні компонента
  onUnmounted(() => {
    leave()
  })

  return {
    join,
    leave,
    isConnected,
    isConnecting,
    participants,
    localParticipant: room.localParticipant
  }
}