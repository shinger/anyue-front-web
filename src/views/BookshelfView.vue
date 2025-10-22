<script setup>
import FileUpload from '@/components/FileUpload.vue'
import {onBeforeMount, ref} from 'vue'
import request from "@/utils/request.js";


const books = ref([])

onBeforeMount(() => {
  request.getShelfBooks().then(response => {
    books.value = response
    console.log(response)
  })
})

</script>

<template>
  <main>
    <div class="shelf-list">
      <a :href="`/book/${book.id}`" class="shelf-book" v-for="book in books" :key="book.id">
        <div class="book-cover">
          <img :src="book.cover" alt="" />
        </div>
        <div class="title">{{book.title}}</div>
      </a>
      <div href="" class="shelf-book">
        <FileUpload />
      </div>
    </div>
  </main>
</template>

<style lang="less" scoped>
main {
  width: 100%;
  position: absolute;
  top: 0;
  padding-inline: var(--bg-padding);
}
.shelf-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 40px;
  .shelf-book {
    content-visibility: auto;
    position: relative;
    display: block;
    width: 128px;
    height: auto;
    margin-right: 36px;
    margin-bottom: 44px;
    .book-cover {
      width: 100%;
      height: 185px;
      img {
        vertical-align: top;
        width: 100%;
        height: 100%;
        background-color: rgb(216, 216, 216);
        object-fit: cover;
      }
    }
    .title {
      margin-top: 14px;
      font-size: 15px;
      line-height: 18px;
      text-align: center;
    }
  }
}
</style>
