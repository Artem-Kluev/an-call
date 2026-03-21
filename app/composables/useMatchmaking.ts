import type { Database } from '~/types/database.types'

export const useMatchmaking = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const matchResult = ref<{ room_name: string } | null>(null)
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let channel: any = null // Зберігаємо канал для відписки
  const startSearch = async (profile: { gender: string, search_for: string, city: string, age: number }) => {
    const userId = user.value?.sub
    if (!userId) return null

    console.log("Starting search with profile:", profile, "UserId:", userId)
    //@ts-ignore
    const { data, error } = await supabase.rpc('find_match_v2', {
      p_user_id: userId,

    })

      //     p_gender: profile.gender,
      // p_search_for: profile.search_for,
      // p_city: profile.city,
      // p_age: profile.age

    if (error) {
      console.error("Matchmaking RPC error:", error)
      return null
    }

    console.log("Matchmaking RPC response:", data)

    // В Postgres функція повертає RETURNS TABLE, у JS це масив
    if (data && (data as any)[0]?.room_name) {
      const roomName = (data as any)[0].room_name
      console.log("Match found immediately:", roomName)
      matchResult.value = { room_name: roomName }
      return roomName
    }

    console.log("No immediate match, waiting for Realtime...")
    subscribeToMatch()
    initHeartbeat()
    return null
  }

  const subscribeToMatch = () => {
    const userId = user.value?.sub
    if (!userId) return

    console.log("Subscribing to match events for user:", userId)

    channel = supabase
      .channel(`match_${userId}`) 
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matchmaking_queue',
        filter: `user_id=eq.${userId}` 
      }, (payload: any) => {
        console.log("Received Realtime match payload:", payload)
        if (payload.new?.is_matched && payload.new?.room_id) {
          console.log("Match found via Realtime:", payload.new.room_id)
          matchResult.value = { room_name: payload.new.room_id }
          stopMatchmaking() 
        }
      })
      .subscribe((status: any) => {
        console.log("Realtime subscription status:", status)
      })
  }

  const initHeartbeat = () => {
    const userId = user.value?.sub
    if (!userId) return

    // Зупиняємо старий, якщо він раптом був
    if (heartbeat) clearInterval(heartbeat)

    heartbeat = setInterval(async () => {
      await supabase
        .from('matchmaking_queue')
        .update({ last_ping: new Date().toISOString() })
        .eq('user_id', userId)
    }, 15000)
  }

  const stopMatchmaking = async () => {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }

    // Використовуємо .id для видалення
    const userId = user.value?.sub
    if (userId) {
      await supabase.from('matchmaking_queue').delete().eq('user_id', userId)
    }
  }

  onUnmounted(() => {
    stopMatchmaking()
  })

  return { startSearch, stopMatchmaking, matchResult }
}