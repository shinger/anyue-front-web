<script setup>
import Epub, { Book, EpubCFI, Layout, Rendition } from "epubjs";
import Themes from "epubjs/lib/themes";
import axios from "@/utils/axios.js";
import { onBeforeMount, onMounted, ref, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const rendition = ref(null);
const openSetting = ref(0);
const showDot = ref(2);
const tocList = ref([]);
const bookInformation = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const totalDuration = ref();
const timerIsActive = ref(true);
const locations = ref(null);
const readingRecord = ref(null);

// 页面离开前调用
const beforeLeave = () => {
  // 获取当前阅读位置
  let location = rendition.value.currentLocation();
  let cfiString = location.start.cfi;

  // 记录结束时间
  endTime.value = new Date().getTime();
  if (timerIsActive.value) {
    totalDuration.value = (endTime.value - startTime.value) / 60000;
  }
  window.removeEventListener("visibilitychange", handleVisibilityChange);

  const progress = locations.value.percentageFromCfi(location.start.cfi);
  axios
    .post("/reading/record/upload", {
      bookId: route.params.id,
      lastReadCfi: cfiString,
      readingProgress: progress.toFixed(4) * 100,
      readingDuration: Math.floor(totalDuration.value),
    })
    .then((result) => {
      console.log(result);
    });
};

// 路由守卫
router.beforeEach((to, from, next) => {
  if (from.path === route.path) {
    beforeLeave();
  }
  next();
});

onMounted(() => {
  // 添加页面时间监听
  window.addEventListener("beforeunload", beforeLeave);
  window.addEventListener("unload", beforeLeave);

  // 记录阅读开始时间
  startTime.value = new Date().getTime();
  window.addEventListener("visibilitychange", handleVisibilityChange);
});

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

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener("beforeunload", beforeLeave);
  window.removeEventListener("unload", beforeLeave);
});

// 切换字体
const changeFont = (i) => {
  showDot.value = i;
  rendition.value.themes.fontSize(12 + i * 2 + "px");
};

// 切换目录
const changeToc = (item) => {
  rendition.value.display(item.href);
};

// 设置
const onSetting = (i) => {
  if (i == 1 || i == 2) {
    openSetting.value = i;
  }
  if (i == 1) {
  }
  if (i == 3) {
    testLog();
  }
};

// 渲染Epub
const renderEpub = (url) => {
  // 设置布局模式
  let layout = new Layout({
    layout: "flow", // 默认为可重排文本
    minSpreadWidth: 800, // 当宽度超过800px时使用对页布局
    evenSpreads: false, // 不强制偶数对页
  });

  // 获取屏幕宽度
  let screenWidth = window.innerWidth;

  // 根据屏幕宽度切换对页显示
  if (screenWidth >= 800) {
    // 当屏幕宽度大于等于800px时，使用对页布局
    let spreadResult = layout.spread("auto", 800); // auto 表示根据宽度自动切换
    console.log("Using spread layout:", spreadResult); // 输出 true 或 false
  } else {
    // 当屏幕宽度小于800px时，使用单页布局
    let spreadResult = layout.spread("none", 0); // none 表示不使用对页
    console.log("Using single page layout:", spreadResult); // 输出 false
  }

  // 加载书本
  let book = new Book(url);
  book.loaded.navigation.then((doc) => {
    tocList.value = doc.toc;
    book.locations.generate();
    locations.value = book.locations;
  });
  // 渲染
  rendition.value = book.renderTo("read", {
    width: "93%",
    height: "96%",
    layout: layout,
    spread: "auto",
  });

  // 设置默认样式
  let themes = new Themes(rendition.value);
  themes.default({
    p: {
      margin: "0.5em 1em !important",
    },
    ".block_9,.block_12": {
      "line-height": "1.8",
      margin: "12px",
      "text-indent": "0",
    },
    ".calibre": {
      "font-size": "1.1em",
    },
  });
  // 展示
  rendition.value.display().then(() => {
    if (readingRecord.value != null && readingRecord.value.lastReadCfi != null) {
      rendition.value.display(readingRecord.value.lastReadCfi);
    }
  });
};

// 发起请求获取书本信息
axios.get(`/book/${route.params.id}`).then((result) => {
  bookInformation.value = result;
});

axios.get(`/reading/record/${route.params.id}`).then((result) => {
  readingRecord.value = result;
});

// 发起请求获取
axios.get(`/bookshelf/${route.params.id}`).then((response) => {
  renderEpub(response);
});

// 上一页
const preview = () => {
  rendition.value.prev();
};

// 下一页
const next = () => {
  rendition.value.next();
};
</script>

<template>
  <main>
    <div class="book-page">
      <div class="read-wrapper">
        <div id="read"></div>
        <div class="setting-wrapper" v-show="openSetting">
          <div class="setting-toc" v-show="openSetting == 1">
            <a class="book-info" :href="`/introduction/${route.params.id}`">
              <img class="cover" :src="bookInformation.cover" />
              <div class="right-wrapper">
                <p class="title">{{ bookInformation.title }}</p>
                <p class="author">{{ bookInformation.author }}</p>
              </div>
            </a>
            <div class="toc-wrapper">
              <nav class="toc-list">
                <li class="toc-item" v-for="item in tocList" :key="item.id">
                  <a @click="changeToc(item)">{{ item.label }}</a>
                </li>
              </nav>
            </div>
          </div>
          <div class="setting-font" v-show="openSetting == 2">
            <span>字号大小</span>
            <div class="fontsize-bar">
              <div class="preview">A</div>
              <div class="preview">A</div>
            </div>
            <div class="slider-dot"></div>
            <div class="select-wrapper">
              <div
                class="select-dot"
                v-for="i in 7"
                :key="i"
                :style="`margin-left:${(i - 1) * 48}px;`"
                @click="changeFont(i)"
              ></div>
              <div
                class="slider-line"
                v-for="i in 7"
                :key="i"
                :style="`width:${(i - 1) * 50 + 32}px;`"
                v-show="i == showDot"
              >
                <div class="right-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="paginate-mask">
        <div class="opt-bar">
          <button class="paginate-btn" @click="preview">&lt; prev</button>
          <button class="paginate-btn" @click="next">next &gt;</button>
        </div>
      </div>
      <div class="sidebar-mask">
        <div class="opt-bar">
          <button class="circle-btn" @click="onSetting(1)">
            <a class="iconfont"
              ><svg
                t="1732024918256"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1748"
                width="20"
                height="20"
              >
                <path
                  d="M20.48 10.24h983.04v983.04H20.48z"
                  fill="#FFFFFF"
                  p-id="1749"
                ></path>
                <path
                  d="M112.64 256A30.72 30.72 0 0 1 143.36 225.28h737.28A30.72 30.72 0 0 1 880.64 286.72H143.36a30.72 30.72 0 0 1-30.72-30.72z m0 245.76A30.72 30.72 0 0 1 143.36 471.04h737.28a30.72 30.72 0 0 1 0 61.44H143.36a30.72 30.72 0 0 1-30.72-30.72zM143.36 716.8A30.72 30.72 0 0 0 143.36 778.24h737.28a30.72 30.72 0 0 0 0-61.44H143.36z"
                  fill="#000000"
                  p-id="1750"
                ></path></svg
            ></a>
          </button>
          <button class="circle-btn" @click="onSetting(2)">
            <a class="iconfont">
              <svg
                t="1732025290877"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1952"
                width="20"
                height="20"
              >
                <path
                  d="M20.48 10.24h983.04v983.04H20.48z"
                  fill="#FFFFFF"
                  p-id="1953"
                ></path>
                <path
                  d="M539.48416 146.51392a30.72 30.72 0 0 0-54.96832 0L143.03232 829.44a30.72 30.72 0 0 0 54.96832 27.4432l128.12288-256.2048h371.79392l128.08192 256.2048a30.72 30.72 0 1 0 54.96832-27.4432l-135.7824-271.5648a31.00672 31.00672 0 0 0-1.59744-3.19488l-204.10368-408.20736z m127.71328 392.76544H356.84352L512 228.92544l155.19744 310.35392z"
                  fill="#000000"
                  p-id="1954"
                ></path>
              </svg>
            </a>
          </button>
          <button class="circle-btn" @click="onSetting(3)">
            <a class="iconfont">
              <svg
                t="1732025364793"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2156"
                width="20"
                height="20"
              >
                <path
                  d="M20.48 10.24h983.04v983.04H20.48z"
                  fill="#FFFFFF"
                  p-id="2157"
                ></path>
                <path
                  d="M542.72 114.2784a30.72 30.72 0 0 0-61.44 0v75.5712a30.72 30.72 0 0 0 61.44 0V114.2784z m273.8176 85.07392a30.72 30.72 0 0 1 0.12288 43.4176L770.12992 289.5872a30.72 30.72 0 0 1-43.54048-43.29472l46.4896-46.77632a30.72 30.72 0 0 1 43.4176-0.12288zM273.69472 511.26272a238.67392 238.67392 0 1 1 477.34784 0 238.67392 238.67392 0 0 1-477.34784 0z m238.67392-177.27488a177.23392 177.23392 0 1 0 0 354.5088 177.23392 177.23392 0 0 0 0-354.5088zM289.34144 767.09888A30.72 30.72 0 1 0 245.76 723.7632l-38.7072 38.912a30.72 30.72 0 0 0 43.58144 43.33568l38.7072-38.912z m222.65856 34.816a30.72 30.72 0 0 1 30.72 30.72v56.7296a30.72 30.72 0 1 1-61.44 0v-56.7296a30.72 30.72 0 0 1 30.72-30.72z m302.4896-340.29568a30.72 30.72 0 0 0 0 61.44h75.61216a30.72 30.72 0 0 0 0-61.44h-75.61216z m-68.4032 254.40256a30.72 30.72 0 0 1 43.45856 0l46.6944 46.6944a30.72 30.72 0 1 1-43.45856 43.4176l-46.6944-46.65344a30.72 30.72 0 0 1 0-43.4176zM133.9392 480.50176a30.72 30.72 0 0 0 0 61.44h75.61216a30.72 30.72 0 0 0 0-61.44H133.89824z m92.5696-281.10848a30.72 30.72 0 0 1 43.4176 0l38.83008 38.83008a30.72 30.72 0 1 1-43.4176 43.4176l-38.83008-38.78912a30.72 30.72 0 0 1 0-43.4176z"
                  fill="#000000"
                  p-id="2158"
                ></path>
              </svg>
            </a>
          </button>
        </div>
      </div>
    </div>
    <div class="mask" v-show="openSetting > 0" @click="openSetting = 0"></div>
  </main>
</template>

<style lang="less" scoped>
main {
  background: var(--color-background-light);
  width: 100%;
  padding-inline: var(--bg-padding);
  padding-block: 2rem;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgb(65 65 65 / 20%);
}

.book-page {
  height: calc(100vh - 120px);
  background: var(--color-page);
  border-radius: 8px;
  .read-wrapper {
    width: 100%;
    height: 100%;
    padding-bottom: 2rem;
    #read {
      width: 100%;
      height: 100%;
      padding-left: 7%;
      padding-top: 3%;
    }
  }
}
.setting-wrapper {
  z-index: 10;
  width: 360px;
  height: 598px;
  position: fixed;
  right: 128px;
  top: 88px;
  background: var(--color-background-pure);
  border-radius: 8px;
  padding: 16px;
  overflow-y: scroll;
}

.setting-wrapper::-webkit-scrollbar {
  border: none;
  width: 4px;
}

.setting-wrapper::-webkit-scrollbar-thumb {
  border-radius: 2px;
  -webkit-box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.2);
  background: #c7c7c7;
}

.setting-toc {
  .book-info {
    display: flex;
    cursor: pointer;
    .cover {
      width: 60px;
      height: 90px;
      margin-right: 14px;
    }
    .right-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .title {
        font-size: 20px;
        font-weight: 600;
      }
      .author {
        font-size: 16px;
      }
    }
  }
  .toc-wrapper {
    .toc-list {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .toc-item {
        border-top: 1px solid var(--color-border);
        height: 48px;
        line-height: 48px;
        font-size: 16px;
      }
    }
  }
}

.setting-font {
  display: flex;
  flex-direction: column;
  .fontsize-bar {
    align-self: center;
    display: flex;
    justify-content: space-between;
    background: #eceef0;
    border-radius: 18px;
    width: 100%;
    height: 32px;
    cursor: pointer;
    .preview {
      z-index: 5;
      margin-inline: 8px;
      line-height: 32px;
    }
  }
  .select-wrapper {
    z-index: 2;
    position: relative;
    left: 0;
    // display: grid;
    // grid-template-columns: repeat(7, 1fr);
    width: 100%;
    height: 32px;
    border-radius: 18px;
    .select-dot {
      position: absolute;
      top: -32px;
      height: 32px;
      width: 32px;
      opacity: 1;
      z-index: 20;
      cursor: pointer;
    }
    .slider-line {
      position: absolute;
      top: -32px;
      height: 32px;
      border-radius: 18px;
      background: #e1e3e6;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 4px;
      cursor: pointer;
      .right-dot {
        background: #fff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
      }
    }
  }
}
.paginate-mask {
  position: relative;
  z-index: 5;
  bottom: 45px;
  width: 100%;
}
.opt-bar {
  padding-inline: 50px;
  display: flex;
  justify-content: space-between;
  .paginate-btn {
    width: 64px;
    height: 30px;
    color: #5d646e;
    border: 1px solid #ccc;
    border-color: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    background: #fff;
    &:hover {
      cursor: pointer;
      background: #ededed;
    }
  }
}

.sidebar-mask {
  position: fixed;
  z-index: 5;
  right: -10px;
  top: 200px;
  display: flex;
  flex-direction: column;
  .opt-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    .circle-btn {
      padding: 10px;
      margin-block: 16px;
      border-radius: 50%;
      overflow: hidden;
      .iconfont {
        display: block;
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
