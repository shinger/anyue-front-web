<script setup>
import Themes from "epubjs/src/themes";
import request from "@/utils/request.js";
import {
  onBeforeMount,
  onMounted,
  ref,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useThemeStore } from "@/stores/theme-store.js";
import { useBookStore } from "@/stores/book-store.js";
import { ReadingStatus } from "@/utils/enums.js";
import ReadArea from "@/components/ReadArea.vue";
import PenIcon from "@/components/icons/PenIcon.vue";
import FontIcon from "@/components/icons/FontIcon.vue";
import ThemeIcon from "@/components/icons/ThemeIcon.vue";
import MenuIcon from "@/components/icons/MenuIcon.vue";

const router = useRouter();
const route = useRoute();
const openSetting = ref(0);
const bookInformation = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const totalDuration = ref();
const timerIsActive = ref(true);
const themeStore = useThemeStore();
const bookStore = useBookStore();
const readingRecord = ref(null);
const readFinished = ref(false);
const epubURL = ref(null);
const readAreaRef = ref(null);

const renderEpub = (url) => {
  nextTick(() => {
    readAreaRef.value.renderEpub(url);
  });
};

// 路由守卫
onBeforeRouteLeave((to, from) => {
  if (from.path === route.path) {
    beforeLeave();
  }
  // next();
});

onBeforeMount(() => {
  // 添加页面时间监听
  window.addEventListener("beforeunload", beforeLeave);
  window.addEventListener("unload", beforeLeave);

  // 记录阅读开始时间
  startTime.value = new Date().getTime();
  window.addEventListener("visibilitychange", handleVisibilityChange);

  

  // 发起请求获取书本信息
  request.getBookInfo(route.params.id).then((result) => {
    bookInformation.value = result;
    bookStore.setBookInfo(result);
    if (result.readingStatus == ReadingStatus.READOVER) {
      readFinished.value = true;
    }
    epubURL.value = result.epubURL;
    renderEpub(result.epubURL);
  });

  request.getReadingRecord(route.params.id).then((result) => {
    readingRecord.value = result;
    if (result.readingStatus == ReadingStatus.READOVER) {
      readFinished.value = true;
    }
  });
});

let debounceTimer;
onMounted(() => {
  // 监听窗口大小变化，重新渲染epub
  window.addEventListener("resize", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      readAreaRef.value.destroyEpub();
      renderEpub(epubURL.value);
    }, 1000);
  });
});

// 页面离开前调用，统计阅读时长
const beforeLeave = () => {
  // 获取当前阅读位置
  let location = readAreaRef.value.getCurrentLocation();
  let cfiString = location.start.cfi;
  console.log(cfiString);

  // 记录结束时间
  endTime.value = new Date().getTime();
  if (timerIsActive.value) {
    // totalDuration.value = (endTime.value - startTime.value) / 60000;
    totalDuration.value = (endTime.value - startTime.value) / 1000;
  }
  console.log("本次阅读时长(Min)：", Math.floor(totalDuration.value));
  window.removeEventListener("visibilitychange", handleVisibilityChange);

  const progress = readAreaRef.value.getProgress();
  request
    .uploadReadingRecord({
      bookId: route.params.id,
      lastReadCfi: cfiString,
      readingProgress: progress.toFixed(4) * 100,
      readingDuration: Math.floor(totalDuration.value),
    })
    .then((result) => {
      console.log(result);
    });
};

// 处理可见性变化
const handleVisibilityChange = () => {
  if (document.visibilityState === "hidden") {
    timerIsActive.value = false;
    totalDuration.value += new Date().getTime() - startTime.value;
  } else {
    timerIsActive.value = true;
    startTime.value = new Date().getTime();
  }
};

// 设置
const onSetting = (i) => {
  switch (i) {
    case 1:
    case 2:
    case 3:
      if (openSetting.value == i) {
        openSetting.value = 0;
        return;
      }
      openSetting.value = i;
      break;
    case 4:
      themeStore.setTheme(!themeStore.themeLight);
      readAreaRef.value.refreshBookTheme();
      break;
    default:
      break;
  }
};
</script>

<template>
  <main class="w-full h-[calc(100vh-120px)] p-2 sm:flex sm:justify-center">
    <!-- 阅读区域 -->
    <div
      class="h-full sm:block sm:relative sm:w-4/5 sm:rounded-2xl sm:bg-white dark:bg-black sm:mt-4"
    >
      <ReadArea
        ref="readAreaRef"
        :openSetting="openSetting"
        :bookInformation="bookInformation"
      />
      <!-- 侧边选项栏 -->
      <div class="hidden sm:block absolute top-45 -right-20">
        <div class="flex flex-col items-center justify-between w-16 h-64">
          <!-- 目录 -->
          <button
            class="p-2.5 rounded-full border border-gray-100 bg-white dark:bg-black dark:border-gray-500 shadow-sm"
            @click="onSetting(1)"
          >
            <a>
              <MenuIcon
                :size="20"
                :theme="themeStore.themeLight ? 'light' : 'dark'"
              />
            </a>
          </button>
          <!-- 字体 -->
          <button
            class="p-2.5 rounded-full border border-gray-100 bg-white dark:bg-black dark:border-gray-500 shadow-sm"
            @click="onSetting(2)"
          >
            <a>
              <FontIcon
                :size="20"
                :theme="themeStore.themeLight ? 'light' : 'dark'"
              />
            </a>
          </button>
          <!-- 笔记 -->
          <button
            class="p-2.5 rounded-full border border-gray-100 bg-white dark:bg-black dark:border-gray-500 shadow-sm"
            @click="onSetting(3)"
          >
            <a
              ><PenIcon
                :size="20"
                :theme="themeStore.themeLight ? 'light' : 'dark'"
            /></a>
          </button>
          <!-- 主题 -->
          <button
            class="p-2.5 rounded-full border border-gray-100 bg-white dark:bg-black dark:border-gray-500 shadow-sm"
            @click="onSetting(4)"
          >
            <a>
              <ThemeIcon
                :size="20"
                :theme="themeStore.themeLight ? 'light' : 'dark'"
              />
            </a>
          </button>
        </div>
      </div>
    </div>

    <!-- 遮罩 -->
    <div
      class="fixed top-0 left-0 bottom-0 right-0 bg-black/20 z-5"
      v-show="openSetting > 0"
      @click="openSetting = 0"
    ></div>
  </main>
</template>

<style></style>
