<template>
  <div class="profile-wrapper">
    <div class="top-header">个人主页</div>
    <div class="information">
      <div class="avatar" @click="selectFile">
        <Avatar size="60" :src="userInfo.avatar" />
        <input
          style="display: none"
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          accept="image/*"
        />
      </div>
      <span class="username">{{ userInfo.username }}</span>
      <p class="introduction">不念过往，不惧将来</p>
    </div>
    <div class="reading-info">
      <div class="reading-duration">
        <div class="statistics">
          {{ userInfo.readingDuration }}<span>分钟</span>
        </div>
        <span class="label">阅读时长</span>
      </div>
      <div class="likes-count">
        <div class="statistics">{{ userInfo.likesCount }}<span>个</span></div>
        <span class="label">收到的赞</span>
      </div>
      <div class="followers-count">
        <div class="statistics">{{ userInfo.followers }}<span>人</span></div>
        <span class="label">关注了我</span>
      </div>
    </div>
    <div class="shelf-info">
      <div class="tab-nav">
        <div :class="{active: tabActive==0}" @click="tabActive=0">书架</div>
        <div :class="{active: tabActive==1}" @click="tabActive=1">读完·0</div>
      </div>
      <div class="book-list">
        <div class="book-item" v-for="item in shelfBooks" :key="item.id">
          <img
            class="book-cover"
            :src="item.cover"
          />
          <span class="title">{{item.title}}</span>
        </div>
      </div>
      <div class="button"><a href="/bookshelf">查看书架</a></div>
    </div>
  </div>
</template>

<script setup>
import Avatar from "@/components/Avatar.vue";
import { ref, onBeforeMount } from "vue";
import axios from "@/utils/axios.js";
import { useToast } from "vue-toast-notification";
import { useUserStore } from "@/stores/user";

const toast = useToast();
const file = ref(null);
const fileInput = ref();
const avatarUrl = ref();
const userInfo = ref();
const shelfBooks = ref()
const tabActive = ref(0)

const userStore = useUserStore();
const maxSize = 2 * 1024 * 1024;

onBeforeMount(() => {
  axios.get("/bookshelf/list").then(response => {
    shelfBooks.value = response.splice(0, 5)
  })
  if (userStore.userInfo != null) {
    userInfo.value = userStore.userInfo;
    return;
  }
  axios.get("/user/info").then((result) => {
    userInfo.value = result;
    userStore.setUserInfo(result);
  });
});

const selectFile = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile.size > maxSize) {
    toast.warning("请上传2MB以下的图片格式文件");
  }
  file.value = selectedFile;
  uploadFile();
};

const uploadFile = async () => {
  if (!file.value) {
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  axios
    .post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      userInfo.value.avatar = response;
    })
    .catch((error) => {
      console.error("上传失败", error);
    });
};
</script>

<style lang="less" scoped>
.profile-wrapper {
  height: calc(100vh - 56px);
  background: var(--color-background-light);
  padding-inline: var(--bg-padding);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  .top-header {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 600;
  }
  .information {
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .username {
      margin-top: 10px;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      line-height: 16px;
    }
    .introduction {
      margin-top: 10px;
      font-size: 14px;
      color: #b6b6b6;
    }
  }
}

.reading-info {
  margin-block: 20px;
  display: flex;
  justify-content: space-between;
  & > div {
    margin-inline: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .statistics {
      font-size: 18px;
      font-weight: 600;
      span {
        margin-left: 4px;
        font-size: 12px;
      }
    }
    .label {
      font-size: 13px;
      color: #969696;
    }
  }
}

.shelf-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background-pure);
  border-radius: 12px;
  .tab-nav {
    margin-top: 12px;
    font-size: 16px;
    display: flex;

    // justify-content: flex-start;
    color: #969696;
    // border-bottom: 1px solid var(--color-border);
    div {
      margin-inline: 160px;
      cursor: pointer;
    }
    .active {
      color: #f39a2c;
    }
  }
  .book-list {
    display: flex;
    align-self: flex-start;
    border-top: 1px solid var(--color-border);
    width: 100%;
    margin-top: 12px;
  }
  .button {
    font-size: 16px;
    margin-bottom: 20px;
  }
}

.book-item {
  margin: 20px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .book-cover {
    width: 120px;
    height: 160px;
  }
}
</style>
