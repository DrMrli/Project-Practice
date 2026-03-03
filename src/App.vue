<script setup>
import { ref } from 'vue'
import TitleBar from './components/TitleBar.vue'

// 用于显示版本号的变量
const appVersion = ref('点击下方按钮查询')

// --- 单向通信的调用方法 ---
function handleShowNotification() {
  // 调用我们在 preload.js 中暴露的 sendNotification 方法
  window.myAPI.sendNotification('这是来自Vue页面的一个IPC通知！')
}

// --- 双向通信的调用方法 ---
// 使用 async/await 来处理异步操作
async function handleGetVersion() {
  console.log('handleGetVersion 函数开始执行')
  appVersion.value = '正在查询...'
  try {
    console.log('准备调用 window.myAPI.getAppVersion()')
    // 使用 await 等待主进程的回复
    const version = await window.myAPI.getAppVersion()
    console.log('获取到版本号:', version)
    appVersion.value = `当前应用版本是：v${version}`
  } catch (error) {
    console.error('获取版本号失败:', error)
    appVersion.value = '获取失败'
  }
  console.log('handleGetVersion 函数执行完成')
}
</script>


<template>
  <!-- 新增一个包裹容器 -->
  <div class="main-container">
    <TitleBar />
    <!-- 你未来的其他内容都放在这里 -->
    <div class="content-area">
      <!-- BrowserView 将会覆盖在这片区域 -->
    </div>
  </div>
</template>

<style>
/* 1. 让根元素透明 */
html, body, #app {
  background-color: transparent;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

/* 2. 在最外层留出空间，给阴影显示 */
#app {
  padding: 1px; /* 这个值约等于阴影的模糊半径 */
  height: 100%;
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>

<style scoped>
.main-container {
  width: 100vw;
  height: 100vh;
  background-color: #282c34; /* 窗口的主背景色 */
  border-radius: 8px; /* 窗口的圆角 */
  overflow: hidden; /* 隐藏子元素溢出的部分 */
  display: flex;
  flex-direction: column;

  /* 3. 关键！应用 drop-shadow 滤镜 */
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
}

.content-area {
  flex-grow: 1; /* 填充剩余空间 */
}
</style>