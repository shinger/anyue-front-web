<template>
  <div
    class="avatar-wrapper"
    :style="{ width: props.size + 'px', height: props.size + 'px' }"
  >
    <img :src="props.src" alt="" />
  </div>
</template>

<script setup>
import { defineProps, onMounted } from "vue";

const props = defineProps(["src", "size"]);

onMounted(() => {
  if (!props.src || props.src == "") {
    props.src =
      "http://127.0.0.1:9000/general/5a3abd0ee2a94fe738954568aedb37c0.png";
  }
});
</script>

<style scoped>
.avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ccc;
  cursor: pointer;
  overflow: hidden;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
