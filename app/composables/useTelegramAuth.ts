interface AuthResult {
  user?: any;
  isNew?: boolean;
  error?: string;
}

function random7DigitNumber() {
  return Math.floor(1000000 + Math.random() * 9000000);
}

export function useTelegramAuth() {
  const supabase = useSupabaseClient();

  const login = async (telegramUser: string) => {
    try {
      const result: AuthResult & { email?: string, token_hash?: string } = await $fetch("/api/telegram-login", {
        method: "POST",
        body: { user: telegramUser, id: random7DigitNumber() },
      });

      if (result.error) {
        console.error("Telegram login error:", result.error);
        return { success: false, error: result.error };
      }

      // 🔐 Виконуємо вхід через верифікацію OTP токену для отримання JWT сесії (Passwordless)
      if (result.email && result.token_hash) {
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          token_hash: result.token_hash,
          type: 'magiclink'
        });
        
        if (authError) throw authError;
      }
      
      return { 
        success: true, 
        user: result.user, 
        isNew: !!result.isNew 
      };
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      return { success: false, error: err.message || "Unknown error" };
    }
  };

  return { login };
}
