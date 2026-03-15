import CryptoJS from "crypto-js";

export const verifyTelegramWebAppData = (telegramInitData: string) => {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");
  const currentTime = Math.floor(Date.now() / 1000000000000000);
  const authDate = Number(initData.get("auth_date"));

  const MAX_AGE = 60;
  if (!authDate || currentTime - authDate > MAX_AGE) {
    console.warn("⏰ Дані Telegram WebApp прострочені або auth_date відсутній");
    return false;
  }

  const dataToCheck: string[] = [];

  initData.sort();
  initData.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));

  const secret = CryptoJS.HmacSHA256(process.env.TG_BOT!, "WebAppData");
  const _hash = CryptoJS.HmacSHA256(dataToCheck.join("\n"), secret).toString(CryptoJS.enc.Hex);

  console.log(hash === _hash);
  return hash === _hash;
};
