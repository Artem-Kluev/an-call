import { Room, RoomEvent, Track, RemoteTrack, ConnectionState } from "livekit-client";

export const useLiveKit = () => {
  const config = useRuntimeConfig();
  const user = useSupabaseUser();
  const hasPartner = ref(false);

  const room = new Room({
    adaptiveStream: true,
    publishDefaults: {
      audioPreset: { maxBitrate: 24000 },
    },
    reconnectPolicy: {
      nextRetryDelayInMs: (context) => {
        if (context.retryCount < 5) return 1000;
        // Якщо за 5 спроби не вийшло, повертаємо null (кінець)
        return null;
      },
    },
  });

  const isMicrophoneEnabled = ref(false);
  const isConnected = ref(false);

  // Автоматично програємо звук співрозмовника
  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
    if (track.kind === Track.Kind.Audio) {
      const el = track.attach();
      document.body.appendChild(el);
    }
  });

  // В useLiveKit.ts

  const setMicrophoneEnabled = async (enabled: boolean) => {
    try {
      await room.localParticipant.setMicrophoneEnabled(enabled);
      isMicrophoneEnabled.value = enabled;
    } catch (e) {
      console.error("Failed to set microphone state", e);
    }
  };

  const toggleMicrophone = async () => {
    await setMicrophoneEnabled(!isMicrophoneEnabled.value);
  };

  const join = async (roomName: string) => {
    const identity = user.value?.sub;

    const { token } = await $fetch<{ token: string }>("/api/token", {
      params: { room: roomName, identity },
    });

    await room.connect(config.public.livekitUrl as string, token, {
      maxRetries: 5,
    });

    // Спробуємо підключити лише мікрофон, якщо камери немає:
    await setMicrophoneEnabled(true);
    isConnected.value = true;
  };

  const leave = async () => {
    await room.disconnect();
    isConnected.value = false;
    isMicrophoneEnabled.value = false;
    // Очищення аудіо-тегів (опціонально, але бажано)
    document.querySelectorAll("audio").forEach((el) => el.remove());
  };

  const sendMessage = async (payload: any) => {
    if (!isConnected.value) return;
    const strData = JSON.stringify(payload);
    const encoder = new TextEncoder();
    await room.localParticipant.publishData(encoder.encode(strData), { reliable: true });
  };

  const onMessage = (callback: (payload: any, participant?: any) => void) => {
    room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const decoder = new TextDecoder();
        const strData = decoder.decode(payload);
        const data = JSON.parse(strData);
        callback(data, participant);
      } catch (e) {
        console.error("Failed to parse LiveKit message", e);
      }
    });
  };

  const onPartnerJoin = (callback: (participant: any) => void) => {
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      callback(participant);
    });
  };

  const onPartnerLeave = (callback: () => void) => {
    room.on(RoomEvent.ParticipantDisconnected, () => {
      callback();
    });
  };

  onUnmounted(leave);

  return {
    join,
    leave,
    isConnected,
    sendMessage,
    onMessage,
    onPartnerJoin,
    onPartnerLeave,
    isMicrophoneEnabled,
    setMicrophoneEnabled,
    toggleMicrophone,
    room,
    hasPartner,
  };
};
