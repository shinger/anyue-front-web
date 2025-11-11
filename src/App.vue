<script setup>
import Avatar from "@/components/Avatar.vue";
import { ref, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useLoginStore } from "@/stores/login.js";
import { useUserStore } from "@/stores/user";
import { useThemeStore } from "@/stores/theme-store.js";
import request from "@/utils/request.js";

const userStore = useUserStore();
const loginStore = useLoginStore();
const avatarIsPop = ref(false);
const avatarUrl = ref("");
const route = useRoute();
const themeRef = ref(null);
const themeStore = useThemeStore();

const logout = () => {
  localStorage.removeItem("token");
  loginStore.updateLogin();
  location.reload();
};

const changeTheme = () => {
  // console.log("change theme");
  themeStore.setTheme(!themeStore.themeLight);
};

onBeforeMount(() => {
  console.log("APP HOME");
  loginStore.updateLogin();

  if (userStore.userInfo != null) {
    userInfo.value = userStore.userInfo;
    return;
  }
  request.getUserInfo().then((result) => {
    console.log(result);
    avatarUrl.value = result.avatar;
    userStore.setUserInfo(result);
  });
});
</script>

<template>
  <!-- <div class="anyue-page"> -->
  <div
    :class="{ 'theme-dark': !themeStore.themeLight, 'theme-light': themeStore.themeLight }"
    class="anyue-main"
    ref="themeRef"
  >
    <header>
      <a href="/" class="logo">
        <span>安阅书屋</span>
      </a>
      <div class="search-wrapper">
        <input type="text" class="search-input" />
      </div>
      <nav>
        <ul class="tabs">
          <li><RouterLink to="/">首页</RouterLink></li>
          <span class="nav-separator"></span>
          <li><RouterLink to="/bookshelf">书架</RouterLink></li>
          <span class="nav-separator"></span>
          <li><RouterLink to="/upload">上传</RouterLink></li>
          <span class="nav-separator"></span>
          <li>
            <RouterLink to="/login" v-if="!loginStore.isLogin">登录</RouterLink>
          </li>
          <li v-if="loginStore.isLogin">
            <Avatar @click="avatarIsPop = !avatarIsPop" :src="avatarUrl" />
          </li>
          <span class="nav-separator"></span>
          <li
            style="display: flex; justify-content: center"
            @click="themeStore.setTheme(!themeStore.themeLight)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              style="width: 24px; height: 24px"
              v-show="themeStore.themeLight"
            >
              <path
                fill="currentColor"
                d="M512 704a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m0-704a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32m0 768a32 32 0 0 1 32 32v64a32 32 0 1 1-64 0v-64a32 32 0 0 1 32-32M195.2 195.2a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 1 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248m543.104 543.104a32 32 0 0 1 45.248 0l45.248 45.248a32 32 0 0 1-45.248 45.248l-45.248-45.248a32 32 0 0 1 0-45.248M64 512a32 32 0 0 1 32-32h64a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32m768 0a32 32 0 0 1 32-32h64a32 32 0 1 1 0 64h-64a32 32 0 0 1-32-32M195.2 828.8a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248L240.448 828.8a32 32 0 0 1-45.248 0m543.104-543.104a32 32 0 0 1 0-45.248l45.248-45.248a32 32 0 0 1 45.248 45.248l-45.248 45.248a32 32 0 0 1-45.248 0"
              ></path>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              style="width: 24px; height: 24px"
              v-show="!themeStore.themeLight"
            >
              <path
                fill="currentColor"
                d="M240.448 240.448a384 384 0 1 0 559.424 525.696 448 448 0 0 1-542.016-542.08 391 391 0 0 0-17.408 16.384m181.056 362.048a384 384 0 0 0 525.632 16.384A448 448 0 1 1 405.056 76.8a384 384 0 0 0 16.448 525.696"
              ></path>
            </svg>
          </li>
        </ul>
      </nav>
      <div class="pop-box" v-show="avatarIsPop">
        <div class="operation-list">
          <li><a href="/profile">个人信息</a></li>
          <li><a @click="logout">退出登录</a></li>
        </div>
      </div>
    </header>
    <div class="anyue-content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="less" scoped>
.anyue-main {
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  header {
    box-sizing: border-box;
    width: 100%;
    height: 56px;
    padding-inline: var(--bg-padding);
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background-light);
  }
}

.pop-box {
  z-index: 10;
  position: fixed;
  right: 94px;
  top: 50px;
  border: 1px solid #ccc;
  background: var(--color-background-pure);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;
  border-radius: 5px;
  .operation-list {
    margin-block: 4px;
    font-size: 14px;
    li {
      margin-block: 6px;
    }
  }
}

.logo {
  background: url("/anyue-logo.png") no-repeat;
  background-size: 32px 32px;
  height: 50px;
  line-height: 50px;
  background-position: 0 10px;
  span {
    margin-left: 45px;
  }
}

.search-wrapper {
  height: 32px;
  width: 320px;
  align-self: center;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  font-size: 14px;
  background-image: url(https://cdn.weread.qq.com/web/wrwebnjlogic/image/icon_search.5731b0d1.png);
  background-repeat: no-repeat;
  background-color: var(--color-background-light);
  background-size: 20px 20px;
  background-position: 12px 7px;
  .search-input {
    margin-left: 48px;
    height: 100%;
    width: 78%;
    font-size: 16px;
    line-height: 16px;
    background-color: var(--color-background-light);
  }
}

nav {
  ul {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 50px;
    li {
      margin-left: 14px;
    }
    .nav-separator {
      display: inline-block;
      width: 14px;
      height: 16px;
      line-height: 50px;
      border-right: solid #acaeb2;
    }
  }
}

.anyue-content {
  width: 100%;
  min-height: calc(100vh - 56px);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-light);
  // padding-inline: var(--bg-margin);
}

@media (max-width: 600px) {
  .logo,
  nav {
    display: none;
  }
  .search-wrapper {
    flex: 1;
  }
}
</style>
