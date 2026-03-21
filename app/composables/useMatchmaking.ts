import type { Database } from '~/types/database.types'

export const useMatchmaking = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const matchResult = ref<{ room_name: string } | null>(null)
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let channel: any = null // Зберігаємо канал для відписки

  const startSearch = async (profile: { gender: string, search_for: string, city: string, age: number }) => {
    // Важливо: використовуємо .id
    console.log(user.value)
    const userId = user.value?.sub

    if (!userId) return null

    console.log(user.value?.sub)

    const { data, error } = await supabase.rpc('find_match_v2', {
      p_user_id: userId,
      p_gender: profile.gender,
      p_search_for: profile.search_for,
      p_city: profile.city,
      p_age: profile.age
    })

    // В Postgres функція повертає RETURNS TABLE, у JS це масив
    if (data && (data as any)[0]?.room_name) {
      const roomName = (data as any)[0].room_name
      matchResult.value = { room_name: roomName }
      return roomName
    }

    subscribeToMatch()
    initHeartbeat()
    return null
  }

  const subscribeToMatch = () => {
    const userId = user.value?.sub
    if (!userId) return

    // Зберігаємо в змінну, щоб потім видалити
    channel = supabase
      .channel(`match_${userId}`) // Унікальне ім'я каналу
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matchmaking_queue',
        filter: `user_id=eq.${userId}` 
      }, (payload: any) => {
        if (payload.new?.is_matched && payload.new?.room_id) {
          matchResult.value = { room_name: payload.new.room_id }
          stopMatchmaking() 
        }
      })
      .subscribe()
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