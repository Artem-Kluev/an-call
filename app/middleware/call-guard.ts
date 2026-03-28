export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath();
  const canEnter = useState("can-enter-call", () => false);

  if (!canEnter.value) {
    return navigateTo(localePath("/"));
  }

  // Optional: Reset it after access to prevent re-entry on refresh
  // canEnter.value = false;
});
