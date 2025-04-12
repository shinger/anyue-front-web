<script setup>
import Avatar from "@/components/Avatar.vue";
import { ref, onBeforeMount } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useLoginStore } from "@/stores/login.js";
import { useUserStore } from "@/stores/user";
import axios from '@/utils/axios.js'

const userStore = useUserStore();
const login = useLoginStore();
const avatarIsPop = ref(false);
const avatarUrl = ref("");

const logout = () => {
  localStorage.removeItem("token");
  login.updateLogin;
  location.reload();
};

onBeforeMount(() => {
  login.updateLogin();
   if (userStore.userInfo != null) {
    userInfo.value = userStore.userInfo;
    return;
  }
  axios.get("/user/info").then((result) => {
    avatarUrl.value = result.avatar;
    userStore.setUserInfo(result);
  });
});
</script>

<template>
  <!-- <div class="anyue-page"> -->
  <div class="anyue-main">
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
            <RouterLink to="/login" v-if="!login.isLogin">登录</RouterLink>
          </li>
          <li v-if="login.isLogin">
            <Avatar
              @click="avatarIsPop = !avatarIsPop"
              :src="avatarUrl"
            />
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
    border-bottom: solid var(--color-border);
  }
}

.pop-box {
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
  border-radius: 18px;
  font-size: 14px;
  background-image: url(https://cdn.weread.qq.com/web/wrwebnjlogic/image/icon_search.5731b0d1.png);
  background-repeat: no-repeat;
  background-color: #f6f7f9;
  background-size: 20px 20px;
  background-position: 12px 7px;
  .search-input {
    margin-left: 48px;
    height: 32px;
    width: 78%;
    font-size: 16px;
    line-height: 16px;
    background-color: #f6f7f9;
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
