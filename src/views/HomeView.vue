<template>
  <main class="home-wrapper">
    <div class="menu-list">
      <div class="menu-wrapper">
        <li class="menu-item"><a href="/category">分类</a></li>
        <li class="menu-item"><a href="">榜单</a></li>
        <li class="menu-item"><a href="">会员专享</a></li>
        <li class="menu-item"><a href="">书单</a></li>
        <li class="menu-item"><a href="">免费书</a></li>
        <li class="menu-item"><a href="">10月新书</a></li>
      </div>
    </div>
    <section class="recommend-list">
      <div class="recommend-title">
        <h3>大家都在看</h3>
        <a class="change" @click="changeBatch">换一批</a>
      </div>
      <div class="content-list">
        <a
          class="book-card"
          :href="`/introduction/${item.id}`"
          v-for="item in recommendList"
          :key="item.id"
        >
          <img :src="item.cover" />
          <span class="book-title">{{ item.title }}</span>
          <span class="book-author">{{ item.author }}</span>
        </a>
      </div>
    </section>
  </main>
</template>

<script setup>
import request from "@/utils/request.js";
import { onBeforeMount, ref } from "vue";

const recommendList = ref([]);

onBeforeMount(() => {
  request.getRecommends().then((result) => {
    recommendList.value = result;
  });
});

const changeBatch = () => {
  request.getRecommends().then((result) => {
    recommendList.value = result;
  });
}
</script>

<style lang="less" scoped>
.home-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-background-light);
  padding-top: 1rem;
  padding-inline: var(--bg-padding);
}

.menu-list {
  display: flex;
  justify-content: center;
  .menu-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
    .menu-item {
      text-align: center;
      padding: 20px;
    }
  }
}

.recommend-list {
  margin-block: 2rem;
  display: flex;
  flex-direction: column;
  .recommend-title {
    display: flex;
    justify-content: start;
    align-items: center;
    line-height: 30px;
    .change {
      color: #969696;
      font-size: 14px;
      margin-left: 12px;
    }
  }
}

.content-list {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-block: 1rem;
  .book-card {
    width: 228px;
    height: 320px;
    margin: 12px;
    padding: 10px;
    background: var(--color-background-pure);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    &:hover {
      transform: scale(1.05);
      transition: transform 0.5s ease;
    }
    img {
      width: 120px;
      height: 180px;
      margin-block: 20px;
    }
    .book-author {
      color: var(--color-little-word);
    }
  }
}
</style>
