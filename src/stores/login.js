import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useLoginStore = defineStore("loginStore", () => {
  let isLogin = false;
  if (localStorage.token) {
    isLogin = true;
  }

  const updateLogin = () => {
    isLogin = localStorage.token != null;
    location.reload;
  };

  return { isLogin, updateLogin };
});
