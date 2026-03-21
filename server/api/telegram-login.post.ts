import { supabaseAdmin } from "../utils/supabase-server";
import { verifyTelegramWebAppData } from "../utils/crypto";

function random7DigitNumber() {
  return Math.floor(1000000 + Math.random() * 9000000);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const initDataString = body.user;

    // ⚠️ Перевірка підпису (передаємо сирий рядок)
    if (!verifyTelegramWebAppData(initDataString)) {
      return { error: "Invalid Telegram signature" };
    }

    // Парсимо дані користувача з рядка ініціалізації
    const params = new URLSearchParams(initDataString);
    const telegramUser = JSON.parse(params.get("user") || "{}");
    //  const telegramId = telegramUser.id;

    const telegramId = body.id;

    if (!telegramId) {
      return { error: "Invalid user data in initData" };
    }

    const email = `${telegramId}@telegram.local`;

    // 1️⃣ Шукаємо користувача за email (це надійніше, ніж метадані)
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = userList.users.find((u) => u.email === email);
    let finalUser = existingUser;

    if (existingUser) {
      // Оновлюємо метадані для існуючого користувача
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          last_login: new Date().toISOString(),
        },
      });
      if (updateError) throw updateError;
      finalUser = updatedUser.user;
    } else {
      // Створюємо нового користувача (passwordless)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_login: new Date().toISOString(),
        },
      });

      if (createError) throw createError;
      finalUser = newUser.user;
    }

    // 🔒 Генеруємо Magic Link через Admin API, щоб безпечно авторизувати клієнта
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError) throw linkError;

    // Отримуємо згенерований хеш токена
    const tokenHash = linkData.properties.hashed_token;

    return { 
      user: finalUser, 
      isNew: !existingUser, 
      email: email, 
      token_hash: tokenHash 
    };
  } catch (error: any) {
    console.error("Auth error:", error);
    return { error: error.message || error };
  }
});
