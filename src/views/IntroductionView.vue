<template>
  <main
    class="px-4 sm:px-12 lg:px-24 mt-7 flex flex-col items-start"
    v-if="bookInformation"
  >
    <section class="w-full my-3 flex pb-6 border-b-2 border-gray-300">
      <img class="w-30 h-40" :src="bookInformation.cover" />
      <div class="flex flex-col items-start justify-center ml-4">
        <h2 class="title">{{ bookInformation.title }}</h2>
        <div class="text-sm text-gray-400">
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
    <section class="flex justify-center my-2 w-full">
      <div
        class="w-32 h-12 mx-6 sm:mx-8 lg:mx-24 bg-gray-300 text-gray-600 flex rounded-md justify-center items-center cursor-pointer"
        @click="join2shelf"
      >
        <span v-if="isInShelf">已加入书架</span>
        <span v-else>加入书架</span>
      </div>
      <a
        class="w-32 h-12 mx-6 sm:mx-8 lg:mx-24 bg-amber-600 text-white flex rounded-md justify-center items-center cursor-pointer"
        :href="`/book/${bookInformation.id}`"
        >阅读</a
      >
    </section>
    <section
      class="w-full flex justify-center my-2 pb-6 border-b-2 border-gray-300"
    >
      <div
        class="flex flex-col items-center justify-center mx-3 text-[#76787c] text-xs font-thin sm:mx-12 lg:mx-24"
      >
        <p>阅读</p>
        <p>
          <span class="text-[#c06016] text-xl font-semibold">{{
            bookInformation.readership
          }}</span
          >人
        </p>
        <p>{{ bookInformation.readingOverCount }}人读完</p>
      </div>
      <span
        class="h-15 leading-18 border-l-2 border-gray-300 self-center"
      ></span>
      <div
        class="flex flex-col items-center justify-center mx-3 text-[#76787c] text-xs font-thin sm:mx-8 lg:mx-24"
      >
        <p>我的阅读</p>
        <div
          class="flex flex-col items-center justify-center mx-3 text-[#76787c] text-xs font-thin sm:mx-8 lg:mx-24"
        >
          <p class="text-base" v-if="readingDuration == 0">无阅读记录</p>
          <div class="text-base flex items-center" v-else>
            <p v-show="readingDuration.hour">
              <span class="text-[#c06016] text-xl font-semibold">{{
                readingDuration.hour
              }}</span
              ><span>小时</span>
            </p>
            <span class="text-[#c06016] text-xl font-semibold">{{
              readingDuration.min
            }}</span
            ><span>分钟</span>
          </div>
        </div>
        <!-- <div v-if="readingStatus == 1">
          <p>
            <span v-show="readingDuration.hour">
              <span class="text-[#c06016] text-xl font-semibold">{{
                readingDuration.hour
              }}</span
              ><span>小时</span>
            </span>
            <span class="text-[#c06016] text-xl font-semibold">{{
              readingDuration.min
            }}</span
            ><span>分钟</span>
          </p>
        </div> -->
        <p v-if="readingStatus == 1">在读</p>
        <p v-else-if="readingStatus == 2">已读完</p>
        <p v-else>去标记</p>
      </div>
      <span
        class="h-15 leading-18 border-l-2 border-gray-300 self-center"
      ></span>
      <div
        class="flex flex-col items-center justify-center mx-4 text-[#76787c] text-xs font-thin sm:mx-12 lg:mx-24"
      >
        <p>字数</p>
        <p>
          <span class="text-[#c06016] text-xl font-semibold">{{
            bookInformation.wordCount
          }}</span
          >万字
        </p>
        <p>
          {{ bookInformation.pressYear }}年{{
            bookInformation.pressMonth
          }}月出版
        </p>
      </div>
    </section>
    <section class="w-full">
      <h1 class="text-xl font-bold">简介</h1>
      <p class="text-lg my-2">
        {{ bookInformation.introduction }}
      </p>
    </section>
    <section class="w-full mt-2">
      <div
        class="w-full rounded-sm border border-gray-300 bg-[#f9f9f9] flex justify-center items-center cursor-pointer"
        @click="showCommentEditor = true"
      >
        写点评
      </div>
      <div class="min-h-24 w-full"></div>
    </section>

    <CommentEditor v-show="showCommentEditor" :bookInfo="bookInformation" @cancel="showCommentEditor = false" />
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import request from "@/utils/request.js";
import CommentEditor from "@/components/CommentEditor.vue";

const route = useRoute();
const router = useRouter();
const bookInformation = ref(null);
const isInShelf = ref(false);
const showCommentEditor = ref(false);
const readingStatus = ref(0);
const readingDuration = reactive({
  hour: 0,
  min: 0,
});
const score = ref(0);



onBeforeMount(() => {
  // 获取书本信息
  request.getBookInfo(route.params.id).then((result) => {
    bookInformation.value = result;
  });
  // 是否在书架内
  request.getIsInShelf(route.params.id).then((result) => {
    isInShelf.value = result;
  });
  // 获取阅读进度
  request.getReadingRecord(route.params.id).then((result) => {
    console.log(result);
    if (result != null) {
      readingStatus.value = result.readingStatus;
      let duration = result.readingDuration;
      readingDuration.hour = Math.floor(duration / 60);
      readingDuration.min = Math.floor(duration % 60);
      console.log(readingDuration);
    }
  });
});

const join2shelf = () => {
  if (isInShelf.value) {
    request
      .removeFromShelf(route.params.id)
      .then((result) => {
        isInShelf.value = false;
      })
      .catch((error) => {
        console.log(error);
      });
    return;
  }
  request
    .addToShelf(route.params.id)
    .then((result) => {
      console.log(result);
      isInShelf.value = true;
      router.push("/bookshelf");
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>

<style scoped></style>
