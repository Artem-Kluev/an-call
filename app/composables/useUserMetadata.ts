export interface UserMetadata {
  age?: number;
  city?: string;
  gender?: string;
  seeking?: string;
}

export const useUserMetadata = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const metadata = computed<UserMetadata>(() => {
    console.log(user.value)
    return (user.value?.user_metadata as UserMetadata) || {}
  })

  const updateMetadata = async (data: Partial<UserMetadata>) => {
    console.log(user.value)
    if (!user.value) {
      return { error: new Error('User not logged in') }
    }

    try {
      // Merge new data with existing metadata locally for optimistic UI updates
      const updatedMetadata = { ...metadata.value, ...data }
      
      const { data: responseData, error } = await supabase.auth.updateUser({
        data: updatedMetadata
      })

      console.log(responseData)

      if (error) {
        return { error: new Error(error.message) }
      }

      // Supabase's updateUser doesn't always trigger reactivity for useSupabaseUser()
      // so we manually apply it to our local ref.
      if (user.value) {
        user.value.user_metadata = updatedMetadata;
        // Also update the app_metadata for compatibility with older code if needed
        user.value.app_metadata = {
          ...user.value.app_metadata,
          ...updatedMetadata
        };
      }

      return { data: responseData?.user, error: null }
    } catch (e: any) {
      return { error: e }
    }
  }

  return { metadata, updateMetadata }
}
