<template>
  <main class="introduction-wrapper">
    <section class="book-info">
      <img class="book-cover" :src="bookInformation.cover" />
      <div class="info">
        <h2 class="title">{{ bookInformation.title }}</h2>
        <div class="copyright-info">
          <p>作者：{{ bookInformation.author }}</p>
          <p>
            分类：{{ bookInformation.mainCategory }}-{{
              bookInformation.subCategory
            }}
          </p>
          <p>出版社：{{ bookInformation.press }}</p>
          <p>
            出版时间：{{ bookInformation.pressYear }}.{{
              bookInformation.pressMonth
            }}
          </p>
        </div>
      </div>
    </section>
    <section class="book-operation">
      <div class="join-button" @click="join2shelf">
        <span v-if="isInShelf">已加入书架</span>
        <span v-else>加入书架</span>
      </div>
      <a class="read-button" :href="`/book/${bookInformation.id}`">阅读</a>
    </section>
    <section class="book-statistics">
      <div class="read-count statistics-item">
        <p>阅读</p>
        <p>
          <span class="large">{{ bookInformation.readership }}</span
          >人
        </p>
        <p>0人读完</p>
      </div>
      <span class="separator"></span>
      <div class="time-count statistics-item">
        <p>我的阅读</p>
        <div class="statistics-item" v-if="readingStatus == 0">
          <p style="font-size:16px;" v-if="readingDuration==0">无阅读记录</p>
          <p style="font-size:16px;" v-else><span class="large">{{readingDuration}}</span>分钟</p>
          <p>去标记</p>
        </div>
        <div v-if="readingStatus == 1">
          <p><span class="large">{{readingDuration}}</span>分钟</p>
          <p>在读</p>
        </div>
      </div>
      <span class="separator"></span>
      <div class="word-count statistics-item">
        <p>字数</p>
        <p>
          <span class="large">{{ bookInformation.wordCount }}</span
          >万字
        </p>
        <p>
          {{ bookInformation.pressYear }}年{{
            bookInformation.pressMonth
          }}月出版
        </p>
      </div>
    </section>
    <section class="introduction">
      <h1>简介</h1>
      <p style="font-size: 18px; margin-block: 8px">
        {{ bookInformation.introduction }}
      </p>
    </section>
    <section class="comments">
      <div class="comment-item"></div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/utils/axios.js";

const route = useRoute();
const router = useRouter();
const bookInformation = ref(null);
const isInShelf = ref(false);
const readingStatus = ref(0);
const readingDuration = ref(null);

onBeforeMount(() => {
  // 获取书本信息
  axios.get(`/book/${route.params.id}`).then((result) => {
    bookInformation.value = result;
  });
  // 是否在书架内
  axios.get(`/bookshelf/inshelf//${route.params.id}`).then((result) => {
    isInShelf.value = result;
  });
  // 获取阅读进度
  axios.get(`/reading/record/${route.params.id}`).then((result) => {
    console.log(result);
    if (result != 0) {
      readingStatus.value = result.readingStatus;
      readingDuration.value = result.readingDuration;
    }
  });
});

const join2shelf = () => {
  if (isInShelf.value) {
    axios
      .delete(`/bookshelf/remove/${bookInformation.value.id}`)
      .then((result) => {
        isInShelf.value = false;
      });
    return;
  }
  axios.post(`/bookshelf/join/${bookInformation.value.id}`).then((result) => {
    console.log(result);
    isInShelf.value = true;
    router.push("/bookshelf");
  });
};

const read = () => {
  rou;
};
</script>

<style lang="less" scoped>
.introduction-wrapper {
  padding-inline: var(--bg-padding);
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
section {
  margin-block: 12px;
  width: 100%;
}
.book-info {
  display: flex;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
  .book-cover {
    width: 120px;
    height: 162px;
  }
  .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 14px;
    justify-content: center;
    .copyright-info {
      color: var(--color-little-word);
      font-size: 14px;
    }
  }
}
.book-operation {
  display: flex;
  justify-content: center;
  div,
  a {
    width: 132px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    border-radius: 6px;
    margin-inline: 48px;
    cursor: pointer;
  }
  .join-button {
    color: #777777;
    background: #dfdede;
  }
  .read-button {
    color: #fff;
    background: #ec8b41;
  }
}
.book-statistics {
  display: flex;
  justify-content: center;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
  .separator {
    height: 60px;
    line-height: 72px;
    border-left: 2px solid var(--color-border);
    align-self: center;
  }
  .statistics-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-inline: 48px;
    color: #76787c;
    font-weight: 100;
    font-size: 12px;
    .large {
      color: #c06016;
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
