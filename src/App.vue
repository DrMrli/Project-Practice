<script setup>
import { ref } from 'vue'

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
  <div class="card-container">
    <!-- 案例一：单向通信 -->
    <div class="action-card">
      <h2>案例一：单向通信 (send / on)</h2>
      <p>点击按钮，主进程会弹出一个系统通知。</p>
      <button @click="handleShowNotification">显示系统通知</button>
    </div>

    <!-- 案例二：双向通信 -->
    <div class="action-card">
      <h2>案例二：双向通信 (invoke / handle)</h2>
      <p>点击按钮，从主进程获取应用版本号并显示。</p>
      <p class="version-display">{{ appVersion }}</p>
      <button @click="handleGetVersion">查询应用版本</button>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  font-family: sans-serif;
}

.action-card {
  width: 80%;
  max-width: 500px;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.action-card h2 {
  margin-top: 0;
  color: #1e40af;
}

.action-card p {
  color: #374151;
  min-height: 1.5em; /* 保证高度，防止按钮跳动 */
}

.version-display {
  font-weight: bold;
  color: #166534;
}

button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #1d4ed8;
}
</style>