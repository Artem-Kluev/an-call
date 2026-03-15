interface AuthResult {
  user?: any;
  isNew?: boolean;
  error?: string;
}

export function useTelegramAuth() {
  const user = ref<any>(null);
  const isNew = ref<boolean>(false);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const supabase = useSupabaseClient();

  const login = async (telegramUser: string) => {
    loading.value = true;
    error.value = null;

    try {
      const result: AuthResult = await $fetch("/api/telegram-login", {
        method: "POST",
        body: { user: telegramUser },
      });

      if (result.error) {
        error.value = result.error;
        loading.value = false;
        return;
      }

      user.value = result.user;
      isNew.value = !!result.isNew;
    } catch (err: any) {
      error.value = err.message || "Unknown error";
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    isNew,
    error,
    loading,
    login,
  };
}
