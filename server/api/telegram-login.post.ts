import { supabaseAdmin } from "../utils/supabase-server";
import { verifyTelegramWebAppData } from "../utils/crypto";

// Перевірка підпису Telegram

const initData =
  "user=%7B%22id%22%3A665557371%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D0%B5%D0%BC%22%2C%22last_name%22%3A%22%D0%9A%D0%BB%D1%8E%D0%B5%D0%B2%22%2C%22username%22%3A%22kluev_artem%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fz13dEZ_cHV9BtxC4uuc54qB_jjt4BJuFm97mqQ1gz4Q.svg%22%7D&chat_instance=-5190874424870972511&chat_type=sender&auth_date=1759599219&signature=dDnenycWMaxTuM7oSec7pUaMuSG7ZOUZsSMZ4g2kBcgFPlNew_7zruNNUGTNvOY6mceL2Bs-uEL1lvrV3a-dAw&hash=a26cd5f3cfa7dccf035e4ffbfeb739bbbba6f73a33c2846a2eb6e7e0d632d873";

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
    const telegramId = telegramUser.id;

    if (!telegramId) {
      return { error: "Invalid user data in initData" };
    }

    const email = `${telegramId}@telegram.local`;

    // 1️⃣ Шукаємо користувача за email (це надійніше, ніж метадані)
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = userList.users.find((u) => u.email === email);

    if (existingUser) {
      // Оновлюємо метадані для існуючого користувача
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          last_login: new Date().toISOString(),
        },
      });
      if (updateError) throw updateError;

      return { user: updatedUser.user, isNew: false };
    }

    // 2️⃣ Створюємо нового користувача
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: String(telegramId),
      email_confirm: true,
      user_metadata: {
        telegram_id: telegramId,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_login: new Date().toISOString(),
      },
    });

    if (createError) throw createError;

    return { user: newUser, isNew: true };
  } catch (error: any) {
    console.error("Auth error:", error);
    return { error: error.message || error };
  }
});
