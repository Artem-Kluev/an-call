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
    return (user.value?.user_metadata as UserMetadata) || {}
  })

  const updateMetadata = async (data: Partial<UserMetadata>) => {
    if (!user.value) {
      return { error: new Error('User not logged in') }
    }

    try {
      // Merge new data with existing metadata locally for optimistic UI updates
      const updatedMetadata = { ...metadata.value, ...data }
      
      const { data: responseData, error } = await supabase.auth.updateUser({
        data: updatedMetadata
      })


      if (error) {
        return { error: new Error(error.message) }
      }

      // Update the reactive user state with the data returned from the server
      if (responseData?.user) {

        await supabase.auth.refreshSession()
      }

      return { data: responseData?.user, error: null }
    } catch (e: any) {
      return { error: e }
    }
  }

  return { metadata, updateMetadata }
}
