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
          {{ readingDuration.hour
          }}<span v-show="readingDuration.hour > 0">小时</span>
          {{ readingDuration.min }}<span>分钟</span>
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
        <div :class="{ active: tabActive == 0 }" @click="tabActive = 0">
          书架·{{ shelfBooks[0].length }}
        </div>
        <div :class="{ active: tabActive == 1 }" @click="tabActive = 1">
          读完·{{ shelfBooks[1].length }}
        </div>
      </div>
      <div class="book-list">
        <a
          :href="`/book/${item.id}`"
          v-show="shelfBooks[tabActive].length > 0"
          class="book-item"
          v-for="item in shelfBooks[tabActive]"
          :key="item.id"
        >
          <img class="book-cover" :src="item.cover" />
          <span class="title">{{ item.title }}</span>
        </a>
        <div v-show="shelfBooks[tabActive].length == 0" class="no-book">
          暂无书籍
        </div>
      </div>
      <div class="button"><a href="/bookshelf">查看书架</a></div>
    </div>
  </div>
</template>

<script setup>
import Avatar from "@/components/Avatar.vue";
import { ref, reactive, onBeforeMount } from "vue";
import request from "@/utils/request.js";
import { useToast } from "vue-toast-notification";
import { useUserStore } from "@/stores/user";
import { useShelfStore } from "@/stores/shelf";

const toast = useToast();
const file = ref(null);
const fileInput = ref();
const avatarUrl = ref();
const userInfo = ref();
const shelfBooks = reactive([[], []]);
const tabActive = ref(0);
const readingDuration = reactive({
  hour: 0,
  min: 0,
});

const userStore = useUserStore();
const shelfStore = useShelfStore();

const maxSize = 2 * 1024 * 1024;

onBeforeMount(() => {
  if (shelfStore.shelfBooks !== null) {
    request.getShelfBooks().then((response) => {
      shelfBooks[0] = response.splice(0, 5);
      shelfBooks[1] = shelfBooks[0].filter((item) => item.readingStatus == 2);
      shelfStore.setShelfBooks(shelfBooks);
    });
  }

  if (userStore.userInfo != null) {
    userInfo.value = userStore.userInfo;
    readingDuration.hour = Math.floor(userInfo.value.readingDuration / 60);
    readingDuration.min = userInfo.value.readingDuration % 60;
    return;
  }
  request.getUserInfo().then((result) => {
    userInfo.value = result;
    readingDuration.hour = Math.floor(userInfo.value.readingDuration / 60);
    readingDuration.min = userInfo.value.readingDuration % 60;
    userStore.setUserInfo(userInfo.value);
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

  request
    .uploadAvatar(formData)
    .then((response) => {
      userInfo.value.avatar = response;
      location.reload();
    })
    .catch((error) => {
      console.error("上传失败", error);
    });
};
</script>

<style lang="less" scoped>
.profile-wrapper {
  position: absolute;
  // left: 0;
  // right: 0;
  height: calc(100vh - 56px);
  max-width: 1200px;
  background: var(--color-background-light);
  padding-inline: var(--bg-padding);
  display: flex;
  justify-content: space-evenly;
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

.no-book {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
  margin-top: 20px;
  font-size: 14px;
  color: #b6b6b6;
}
</style>
