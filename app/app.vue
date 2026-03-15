<script setup>
const initData =
  "user=%7B%22id%22%3A665557371%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D0%B5%D0%BC%22%2C%22last_name%22%3A%22%D0%9A%D0%BB%D1%8E%D0%B5%D0%B2%22%2C%22username%22%3A%22kluev_artem%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fz13dEZ_cHV9BtxC4uuc54qB_jjt4BJuFm97mqQ1gz4Q.svg%22%7D&chat_instance=-5190874424870972511&chat_type=sender&auth_date=1759599219&signature=dDnenycWMaxTuM7oSec7pUaMuSG7ZOUZsSMZ4g2kBcgFPlNew_7zruNNUGTNvOY6mceL2Bs-uEL1lvrV3a-dAw&hash=a26cd5f3cfa7dccf035e4ffbfeb739bbbba6f73a33c2846a2eb6e7e0d632d873";

// const initData =
//   "user=%7B%0%D1%82%D0%B5%D0%BC%22%2C%22last_name%22%3A%22%D0%9A%D0%BB%D1%8E%D0%B5%D0%B2%22%2C%22username%22%3A%22kluev_artem%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fz13dEZ_cHV9BtxC4uuc54qB_jjt4BJuFm97mqQ1gz4Q.svg%22%7D&chat_instance=-5190874424870972511&chat_type=sender&auth_date=1759599219&signature=dDnenycWMaxTuM7oSec7pUaMuSG7ZOUZsSMZ4g2kBcgFPlNew_7zruNNUGTNvOY6mceL2Bs-uEL1lvrV3a-dAw&hash=a26cd5f3cfa7dccf035e4ffbfeb739bbbba6f73a33c2846a2eb6e7e0d632d873";

const { user, isNew, error, loading, login } = useTelegramAuth();

login(initData);

console.log(initData);
</script>

<template>
  {{ user }}
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
</template>
