<template>
  <main class="category-wrapper">
    <div class="left-category-list">
      <li
        class="category-item"
        v-for="item in categoryList"
        :key="item.id"
        @click="changeCategory(item)"
        :class="{ active: activeMainCategory === item }"
      >
        <span href="">{{ item.categoryName }}</span>
      </li>
    </div>
    <div class="right-category-content">
      <div class="sub-category-top">
        <h3>
          {{
            activeMainCategory == null ? "" : activeMainCategory.categoryName
          }}
        </h3>
        <div class="sub-category-list" v-if="subCategoryList.length != 0">
          <li
            class="sub-category-item"
            @click="getAll"
            :class="{ active: isAll == true }"
          >
            全部
          </li>
          <li
            class="sub-category-item"
            v-for="item in subCategoryList"
            :key="item.id"
            @click="changeSubCategory(item)"
            :class="{ active: activeSubCategory === item }"
          >
            {{ item.categoryName }}
          </li>
        </div>
      </div>
      <div class="book-list">
        <div
          class="book-item"
          v-for="item in currentBookList"
          :key="item.id"
          @click="toIntroPage(item.id)"
        >
          <img class="book-cover" :src="item.cover" />
          <div class="book-content">
            <h3>{{ item.title }}</h3>
            <span class="author">{{ item.author }}</span>
            <span class="readership"
              >{{ item.readership }}人在读 | 推荐值 92.3%</span
            >
            <p class="introduction">
              {{ item.introduction }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import request from "@/utils/request.js";

const router = useRouter();
const categoryList = ref([]);
const subCategoryList = ref([]);
const currentBookList = ref([]);
const activeMainCategory = ref(null);
const activeSubCategory = ref(null);
const isAll = ref(true);

const toIntroPage = (id) => {
  console.log(id);
  router.push(`/introduction/${id}`);
};

const getAll = () => {
  isAll.value = true;
  activeSubCategory.value = null;
  request
    .getCategoryBooks(activeMainCategory.value.id)
    .then((result) => {
      currentBookList.value = result;
    })
    .catch((error) => {
      console.log(error);
    });
};

const changeCategory = (item) => {
  activeMainCategory.value = item;
  isAll.value = true;
  request
    .getCategories(item.id)
    .then((result) => {
      subCategoryList.value = result;
    })
    .catch((error) => {
      console.log(error);
    });
  getAll();
};

const changeSubCategory = (item) => {
  activeSubCategory.value = item;
  isAll.value = false;
  request
    .getCategoryBooks(item.id)
    .then((result) => {
      currentBookList.value = result;
    })
    .catch((error) => {
      console.log(error);
    });
};

let loaded = false;

onBeforeMount(() => {
  if (!loaded) {
    request
      .getCategories(0)
      .then((result) => {
        categoryList.value = result;
        changeCategory(result[0]);
      })
      .catch((error) => {
        console.log(error);
      });
    loaded = true;
  }
});
</script>

<style lang="less" scoped>
.category-wrapper {
  position: absolute;
  top: 0;
  padding-inline: var(--bg-padding);
  display: flex;
  justify-content: flex-start;
}
.left-category-list {
  width: 200px;
  height: calc(100vh - 50px);
  // border-right: 2px solid var(--color-border);
  .category-item {
    margin-block: 8px;
    width: 100%;
    height: 42px;
    line-height: 42px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    padding-left: 12px;
    &:hover {
      cursor: pointer;
      background: var(--color-background-hover);
    }
  }
  .active {
    background: #f6963c !important;
    color: #fff I !important;
  }
}
.right-category-content {
  width: 100%;
  border-left: 2px solid var(--color-border);
  .sub-category-top {
    padding: 20px 20px;
    border-bottom: 2px solid var(--color-border);
    display: flex;
    flex-direction: column;
  }
}
.sub-category-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  // grid-template-columns: repeat(5, 1fr); /* 创建 5 列 */
  // grid-template-rows: repeat(3, 40px); /* 创建 3 行，每行高度 100px */
  gap: 50px; /* 网格项之间的间距 */
  font-size: 16px;

  .sub-category-item {
    cursor: pointer;
    font-weight: 1000;
    color: #424242;
    &:hover {
      color: #000;
    }
  }

  .active {
    color: #f6963c !important;
  }
}
.book-list {
  margin-top: 40px;
  .book-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 24px 18px;
    &:hover {
      background: var(--color-background-hover);
      cursor: pointer;
    }
    .book-cover {
      width: 120px;
      height: 162px;
    }
    .book-content {
      width: 600px;
      margin: 12px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .author,
      .readership,
      .introduction {
        color: var(--color-little-word);
        font-size: 14px;
      }
    }
  }
}
</style>
