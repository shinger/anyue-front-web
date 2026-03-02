<script setup>
import Header from "@/components/Header.vue";
import Mask from "@/components/Mask.vue";
import SearchMask from "@/components/SearchMask.vue";
import Message from "@/components/Message.vue";
import { onMounted } from "vue";
import { useThemeStore } from "@/stores/theme-store.js";

const themeStore = useThemeStore();

onMounted(() => {
  if (themeStore.themeLight) {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
});
</script>

<template>
  <div
    class="min-h-screen max-w-screen bg-gray-100 dark:bg-stone-900 dark:text-white"
  >
    <Header />
    <RouterView />
    <Mask />
    <SearchMask />
    <Message />
  </div>
</template>

<style>
</style>
