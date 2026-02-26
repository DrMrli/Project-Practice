<script setup>
import HelloWorld from "./components/HelloWorld.vue";

// 这是新加的代码
const appTitle = import.meta.env.VITE_APP_TITLE;
const apiUrl = import.meta.env.VITE_API_URL;
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <!-- 这是新加的代码块 -->
  <div class="env-info">
    <h2>环境变量展示：</h2>
    <p>应用标题 (VITE_APP_TITLE): <strong>{{ appTitle }}</strong></p>
    <p>API 地址 (VITE_API_URL): <strong>{{ apiUrl }}</strong></p>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
