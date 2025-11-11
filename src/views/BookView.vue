<script setup>
import Epub, { Book, EpubCFI, Layout, Rendition } from "epubjs";
// import Themes from "epubjs/lib/themes";
import Themes from "epubjs/src/themes";
import request from "@/utils/request.js";
import {
  onBeforeMount,
  onMounted,
  ref,
  onBeforeUnmount,
  onUnmounted,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useThemeStore } from "@/stores/theme-store.js";

const router = useRouter();
const route = useRoute();
const book = ref(null);
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
const finishedPage = ref(false);
const readFinished = ref(false);
const highLightTocIndex = ref(null);
const fonts = ref([]);
const themeStore = useThemeStore();

// 页面离开前调用
const beforeLeave = () => {
  // 获取当前阅读位置
  let location = rendition.value.currentLocation();
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

  const progress = locations.value.percentageFromCfi(location.start.cfi);
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

// 路由守卫
onBeforeRouteLeave((to, from) => {
  if (from.path === route.path) {
    beforeLeave();
  }
  next();
});

onBeforeMount(() => {
  // 添加页面时间监听
  window.addEventListener("beforeunload", beforeLeave);
  window.addEventListener("unload", beforeLeave);

  // 记录阅读开始时间
  startTime.value = new Date().getTime();
  window.addEventListener("visibilitychange", handleVisibilityChange);

  // 获取字体列表
  request.getFonts().then((res) => {
    fonts.value = res;
  });
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

  // 销毁 EPUB 对象
  if (rendition.value) {
    rendition.value.destroy();
  }
  if (book.value) {
    book.value = null;
  }
});

// 切换字体
const changeFontSize = (i) => {
  showDot.value = i;
  rendition.value.themes.fontSize(12 + i * 2 + "px");
};

const changeFont = (fontValue) => {
  console.log("change font: ", fontValue);
  rendition.value.themes.font(fontValue);
  rendition.value.hooks.content.register((contents) => {
    Promise.all([
      contents.addStylesheetRules(
        {
          ".calibre8, .x4, .x9": {
            "font-family": `${fontValue} !important`,
          },
        },
        "inner-fonts"
      ),
    ]);
  });
};

// 切换目录
const changeToc = (item) => {
  rendition.value.display(item.href).then(() => {
    const location = rendition.value.currentLocation();
    setHighLight(location);
  });
};

// 设置
const onSetting = (i) => {
  if (i == 1 || i == 2) {
    openSetting.value = i;
  }
  if (i == 1) {
  }
  if (i == 3) {
    themeStore.setTheme(!themeStore.themeLight);
    if (themeStore.themeLight) {
      rendition.value.themes.select("theme-light");
    } else {
      rendition.value.themes.select("theme-dark");
    }
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
  book.value = new Book(url);
  // console.log(book.value.loaded.navigation)
  book.value.loaded.navigation.then((doc) => {
    tocList.value = doc.toc;
    book.value.locations.generate();
    locations.value = book.value.locations;
  });
  // 渲染
  rendition.value = book.value.renderTo("read", {
    width: "93%",
    height: "96%",
    layout: layout,
    spread: "auto",
    manager: "continuous",
  });

  fonts.value.forEach((font) => {
    if (font.url != null) {
      rendition.value.hooks.content.register((contents) => {
        Promise.all(
          contents.addStylesheetRules(
            {
              "@font-face": {
                "font-family": font.fontValue,
                src: `url(${font.url})`,
              },
            },
            "fonts"
          )
        );
      });
    }
  });

  // 设置默认样式
  let themes = new Themes(rendition.value);

  // 展示
  rendition.value.display().then(() => {
    if (
      readingRecord.value != null &&
      readingRecord.value.lastReadCfi != null
    ) {
      // 展示上次阅读的进度
      rendition.value.display(readingRecord.value.lastReadCfi).then(() => {
        // 定位当前目录位置并添加高亮
        const location = rendition.value.currentLocation();
        setHighLight(location);
      });
    }

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
      ".calibre8, .x4, .x9": {
        "font-family": "inherit !important",
      },
      ".theme-dark p": {
        color: "#fff",
      },
    });

    themes.registerThemes({
      "theme-dark": {
        p: {
          color: "#fff",
        },
        color: "#fff",
      },
    });

    themes.registerThemes({
      "theme-light": {
        p: {
          color: "#000",
        },
        color: "#000",
      },
    });

    if (themeStore.themeLight) {
      rendition.value.themes.select("theme-light");
    } else {
      rendition.value.themes.select("theme-dark");
    }
  });
};

// 发起请求获取书本信息
request.getBookInfo(route.params.id).then((result) => {
  bookInformation.value = result;
});

request.getReadingRecord(route.params.id).then((result) => {
  readingRecord.value = result;
});

// 发起请求获取
request.getBookEpub(route.params.id).then((response) => {
  renderEpub(response);
});

// 上一页
const preview = () => {
  if (finishedPage.value) {
    finishedPage.value = false;
    return;
  }
  rendition.value.prev().then(() => {
    const location = rendition.value.currentLocation();
    setHighLight(location);
  });
};

// 下一页
const next = () => {
  const currentLocation = rendition.value.currentLocation();

  rendition.value.next().then(() => {
    setHighLight(rendition.value.currentLocation());
  });

  // 最后一页的逻辑
  const locationLength = locations.value.length();
  const lastEpubCfi = locations.value._locations[locationLength - 1].replace(
    /,(.*?),/,
    ""
  );
  if (lastEpubCfi == currentLocation.end.cfi) {
    finishedPage.value = true;
    console.log("已经是最后一页");
  }
};

const setHighLight = (location) => {
  console.log("Set highlight location: ", location);
  if (highLightTocIndex.value != null) {
    if (highLightTocIndex.value[1] == null) {
      tocList.value[highLightTocIndex.value[0]].highLight = false;
    } else {
      tocList.value[highLightTocIndex.value[0]].subitems[
        highLightTocIndex.value[1]
      ].highLight = false;
    }
  }
  highLightTocIndex.value = location.mapTocIndex;
  if (location.mapTocIndex[1] != null) {
    tocList.value[location.mapTocIndex[0]].subitems[
      location.mapTocIndex[1]
    ].highLight = true;
  } else {
    tocList.value[location.mapTocIndex[0]].highLight = true;
  }

  // if (highLightTocIndex.value != null) {
  //   if (highLightTocIndex.value.s_index == null) {
  //     tocList.value[highLightTocIndex.value.p_index].highLight = false;
  //   } else {
  //     tocList.value[highLightTocIndex.value.p_index].subitems[
  //       highLightTocIndex.value.s_index
  //     ].highLight = false;
  //   }
  // }
  // for (let i = 0; i < tocList.value.length; i++) {
  //   if (tocList.value[i].href == location.end.href) {
  //     tocList.value[i].highLight = true;
  //     highLightTocIndex.value = {
  //       p_index: i,
  //       s_index: null,
  //     };
  //     break;
  //   }
  //   for (let j = 0; j < tocList.value[i].subitems.length; j++) {
  //     if (tocList.value[i].subitems[j].href == location.end.href) {
  //       tocList.value[i].subitems[j].highLight = true;
  //       highLightTocIndex.value = {
  //         p_index: i,
  //         s_index: j,
  //       };
  //       break;
  //     }
  //   }
};

const markFinished = () => {
  request.markFinished(route.params.id).then((result) => {
    console.log(result);
    readFinished.value = true;
  });
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
                <div class="toc-item" v-for="item in tocList" :key="item.id">
                  <li :class="{ highLight: item.highLight == true }">
                    <a @click="changeToc(item)">{{ item.label }}</a>
                  </li>
                  <li
                    class="sub-toc-item"
                    :class="{ highLight: subItem.highLight == true }"
                    v-for="subItem in item.subitems"
                    :key="subItem.id"
                  >
                    <a @click="changeToc(subItem)">{{ subItem.label }}</a>
                  </li>
                </div>
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
                @click="changeFontSize(i)"
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
              <div class="select-font">
                <li
                  v-for="font in fonts"
                  :key="font.id"
                  @click="changeFont(font.fontValue)"
                >
                  <a>{{ font.fontName }}</a>
                </li>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reading-finished" v-show="finishedPage">
        <p>已读完</p>
        <button v-if="!readFinished" class="anyue-button" @click="markFinished">
          标记读完
        </button>
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
            <a class="iconfont">
              <svg
                v-show="!themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.94971 11.9497H39.9497"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.94971 23.9497H39.9497"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.94971 35.9497H39.9497"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-show="themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.94971 11.9497H39.9497"
                  stroke="#000000"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.94971 23.9497H39.9497"
                  stroke="#000000"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.94971 35.9497H39.9497"
                  stroke="#000000"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </button>
          <button class="circle-btn" @click="onSetting(2)">
            <a class="iconfont">
              <svg
                v-show="!themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 8H32"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                />
                <path
                  d="M28 21H44"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                />
                <path
                  d="M18 42L18 8"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                />
                <path
                  d="M36 42L36 21"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-show="themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 8H32"
                  stroke="#000000"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M28 21H44"
                  stroke="#000000"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M18 42L18 8"
                  stroke="#000000"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path
                  d="M36 42L36 21"
                  stroke="#000000"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </a>
          </button>
          <button class="circle-btn" @click="onSetting(3)">
            <a class="iconfont">
              <svg
                v-show="themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 37C31.1797 37 37 31.1797 37 24C37 16.8203 31.1797 11 24 11C16.8203 11 11 16.8203 11 24C11 31.1797 16.8203 37 24 37Z"
                  fill="none"
                  stroke="#000000"
                  stroke-width="4"
                  stroke-linejoin="round"
                />
                <path
                  d="M24 6C25.3807 6 26.5 4.88071 26.5 3.5C26.5 2.11929 25.3807 1 24 1C22.6193 1 21.5 2.11929 21.5 3.5C21.5 4.88071 22.6193 6 24 6Z"
                  fill="#000000"
                />
                <path
                  d="M38.5 12C39.8807 12 41 10.8807 41 9.5C41 8.11929 39.8807 7 38.5 7C37.1193 7 36 8.11929 36 9.5C36 10.8807 37.1193 12 38.5 12Z"
                  fill="#000000"
                />
                <path
                  d="M44.5 26.5C45.8807 26.5 47 25.3807 47 24C47 22.6193 45.8807 21.5 44.5 21.5C43.1193 21.5 42 22.6193 42 24C42 25.3807 43.1193 26.5 44.5 26.5Z"
                  fill="#000000"
                />
                <path
                  d="M38.5 41C39.8807 41 41 39.8807 41 38.5C41 37.1193 39.8807 36 38.5 36C37.1193 36 36 37.1193 36 38.5C36 39.8807 37.1193 41 38.5 41Z"
                  fill="#000000"
                />
                <path
                  d="M24 47C25.3807 47 26.5 45.8807 26.5 44.5C26.5 43.1193 25.3807 42 24 42C22.6193 42 21.5 43.1193 21.5 44.5C21.5 45.8807 22.6193 47 24 47Z"
                  fill="#000000"
                />
                <path
                  d="M9.5 41C10.8807 41 12 39.8807 12 38.5C12 37.1193 10.8807 36 9.5 36C8.11929 36 7 37.1193 7 38.5C7 39.8807 8.11929 41 9.5 41Z"
                  fill="#000000"
                />
                <path
                  d="M3.5 26.5C4.88071 26.5 6 25.3807 6 24C6 22.6193 4.88071 21.5 3.5 21.5C2.11929 21.5 1 22.6193 1 24C1 25.3807 2.11929 26.5 3.5 26.5Z"
                  fill="#000000"
                />
                <path
                  d="M9.5 12C10.8807 12 12 10.8807 12 9.5C12 8.11929 10.8807 7 9.5 7C8.11929 7 7 8.11929 7 9.5C7 10.8807 8.11929 12 9.5 12Z"
                  fill="#000000"
                />
              </svg>
              <svg
                v-show="!themeStore.themeLight"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M28.0527 4.41085C22.5828 5.83695 18.5455 10.8106 18.5455 16.7273C18.5455 23.7564 24.2436 29.4545 31.2727 29.4545C37.1894 29.4545 42.1631 25.4172 43.5891 19.9473C43.8585 21.256 44 22.6115 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C25.3885 4 26.744 4.14149 28.0527 4.41085Z"
                  fill="none"
                  stroke="#f5f5f5"
                  stroke-width="4"
                  stroke-linejoin="round"
                />
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
  position: relative;
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
.reading-finished {
  position: absolute;
  top: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: var(--color-page);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 20px;
  .anyue-button {
    font-size: 14px;
    width: 60px;
    height: 30px;
    margin-block: 8px;
  }
}
.setting-wrapper {
  z-index: 10;
  width: 360px;
  position: fixed;
  right: 128px;
  top: 88px;
  bottom: 32px;
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
        line-height: 48px;
        font-size: 16px;
        .sub-toc-item {
          padding-left: 12px;
          border-top: 1px solid var(--color-border);
          height: 42px;
          line-height: 42px;
          font-size: 14px;
        }
      }
      .highLight a {
        color: #c28e32;
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
    background: var(--color-background-light);
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
      background: var(--color-background-light);
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
    .select-font {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      margin-block: 16px;
      li {
        margin: 4px;
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
    background: var(--color-button);
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
