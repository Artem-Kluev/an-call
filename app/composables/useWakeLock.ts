import { ref, onUnmounted, computed } from 'vue'

export const useWakeLock = () => {
  const sentinel = ref<any>(null)

  const request = async () => {
    if (!import.meta.client || !('wakeLock' in navigator)) return
    
    // If already active, don't request again
    if (sentinel.value) return

    try {
      sentinel.value = await (navigator as any).wakeLock.request('screen')
      
      sentinel.value.addEventListener('release', () => {
        sentinel.value = null
      })
      
    } catch (err) {
      console.warn('Failed to request Wake Lock:', err)
    }
  }

  const release = async () => {
    if (sentinel.value) {
      try {
        await sentinel.value.release()
        sentinel.value = null
      } catch (err) {
        console.error('Failed to release Wake Lock:', err)
      }
    }
  }

  // Handle re-requesting when page visibility changes (browser releases wake lock when hidden)
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && !sentinel.value) {
      // Note: We only re-request if we intentionallly had it active before.
      // However, the caller should manage when to start/stop the lock.
    }
  }

  onUnmounted(() => {
    release()
  })

  return {
    requestWakeLock: request,
    releaseWakeLock: release,
    isActive: computed(() => !!sentinel.value)
  }
}
