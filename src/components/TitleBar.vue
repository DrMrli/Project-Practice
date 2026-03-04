<template>
  <header class="titlebar">
    <!-- 左侧区域 -->
    <div class="titlebar-left">
      <img src="/vite.svg" alt="Logo" class="logo" />
      <span class="title">IntelliView Browser</span>
      <!-- 新增导航按钮组 -->
      <div class="nav-buttons">
        <button class="nav-btn" @click="goBack" :disabled="!canGoBack">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <button class="nav-btn" @click="goForward" :disabled="!canGoForward">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 11v2h13.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L17.17 11H4z"/></svg>
        </button>
        <button class="nav-btn" @click="reloadOrStop">
          <svg v-if="isLoading" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
        </button>
      </div>
    </div>

    <!-- 中间自适应区域 -->
    <div class="titlebar-center" @dblclick="maximize">
      <input
        type="text"
        class="address-bar"
        placeholder="输入网址或搜索内容"
        @keydown.enter="handleUrlInput"
      />
    </div>

    <!-- 右侧控制区域 -->
    <div class="titlebar-right">
      <div class="win-control" @click="minimize">
        <!-- 最小化图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 11H4v2h16z"/></svg>
      </div>
      <div class="win-control" @click="maximize">
        <!-- 根据窗口状态显示不同的图标 -->
        <svg v-if="!isMaximized" viewBox="0 0 24 24" width="16" height="16"><path d="M4 4h16v16H4z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
      </div>
      <div class="win-control close" @click="close">
        <!-- 关闭图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  </header>
  <!-- 在header下方添加进度条 -->
  <div class="progress-bar" :class="{ 'is-loading': isLoading }"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 窗口控制逻辑
const minimize = () => {
  // 调用我们在 preload.js 中暴露的 windowControls.minimize 方法
  window.windowControls.minimize()
}

const maximize = () => {
  window.windowControls.maximize()
}

const close = () => {
  window.windowControls.close()
}

// 窗口最大化状态
const isMaximized = ref(false)

// 1. 创建一个响应式变量来保存加载状态
const isLoading = ref(false)

// 导航状态变量
const canGoBack = ref(false)
const canGoForward = ref(false)

// 事件处理函数
const goBack = () => window.navigation.goBack()
const goForward = () => window.navigation.goForward()
const reloadOrStop = () => {
  if (isLoading.value) {
    window.navigation.stop()
  } else {
    window.navigation.reload()
  }
}

// 组件挂载时注册窗口状态变化监听器
onMounted(() => {
  // 注册监听器，接收来自主进程的窗口状态消息
  window.windowControls.onWindowMaximized((maximized) => {
    console.log('Window maximized status changed:', maximized)
    isMaximized.value = maximized
  })
  
  // 2. 注册加载状态变化监听器
  window.browser.onLoadingStateChange((loadingStatus) => {
    // 当收到主进程的信号时，更新我们的变量
    isLoading.value = loadingStatus
    console.log('Loading state changed:', isLoading.value)
  })
  
  // 新增状态监听
  window.navigation.onNavigateStateChange((navState) => {
    // 收到主进程的“广播”后，更新我们的 ref 变量
    canGoBack.value = navState.canGoBack
    canGoForward.value = navState.canGoForward
    console.log('Nav state updated:', navState)
  })
})

// 处理地址栏输入
const handleUrlInput = (event) => {
  // event.target.value 就是输入框里当前的文本
  const url = event.target.value
  if (url) {
    // 调用我们刚刚在preload中定义的API
    window.browser.loadURL(url)
  }
}
</script>

<style scoped>
.titlebar {
  /* 1. 将标题栏自身变成一个Flex容器 */
  display: flex;
  
  /* 2. 主轴对齐方式：两端对齐 */
  /* 这会让 left 和 right 区域贴边，center 区域在中间 */
  justify-content: space-between;

  /* 3. 交叉轴对齐方式：居中 */
  /* 这会让所有子元素（left, center, right）在垂直方向上居中 */
  align-items: center;

  height: 40px; /* 定义一个标准的标题栏高度 */
  background-color: #282c34;
  color: #e2e8f0;
  padding: 0 8px; /* 左右留出一点边距 */
  user-select: none; /* 禁止文本被选中，提升拖拽体验 */
  width: 100%; /* 确保标题栏宽度为100% */
  box-sizing: border-box; /* 确保padding不会影响宽度 */
  position: relative; /* 确保标题栏在最上层 */
  z-index: 1000; /* 确保标题栏在最上层 */
  
  /* --- 新增这行代码 --- */
  /* 将整个标题栏标记为可拖动区域 */
  -webkit-app-region: drag;
}

.titlebar-left,
.titlebar-right {
  /* 将左右区域内部也变成Flex容器，方便对齐图标和文字 */
  display: flex;
  align-items: center;
  gap: 8px; /* 元素之间的间距 */
  
  /* 为可交互元素“开一个洞”，确保按钮可以被点击 */
  -webkit-app-region: no-drag;
}

.titlebar-left {
  /* 为左侧的Logo和标题区域，恢复默认光标 */
  cursor: default;
}

.titlebar-center {
  /* 4. 关键中的关键！让中间区域自动长大，填满所有剩余空间 */
  flex-grow: 1;
  
  height: 100%; /* 高度撑满 */
  margin: 0 8px; /* 左右边距 */
  display: flex;
  align-items: center; /* 垂直居中 */
  
  /* 为可拖拽的中间区域，设置“移动”光标 */
  cursor: move; /* 或者 'grab' */
}

.logo {
  width: 24px;
  height: 24px;
}

.title {
  font-size: 14px;
  font-weight: 500;
}

.win-control {
  width: 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* 为按钮设置“小手”光标 */
  transition: background-color 0.2s;
}

.win-control svg {
  width: 16px;
  height: 16px;
  fill: #94a3b8; /* 控制SVG图标颜色 */
}

.win-control:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.win-control:hover svg {
  fill: #e2e8f0;
}

.win-control.close:hover {
  background-color: #e81123;
}

.win-control.close:hover svg {
  fill: white;
}

.address-bar {
  flex: 1;
  max-width: 600px;
  height: 28px;
  border-radius: 14px;
  border: none;
  padding: 0 16px;
  background-color: #1e1e1e; /* 调整为适合深色主题的背景 */
  color: white;
  font-size: 14px;
  -webkit-app-region: no-drag; /* 关键！让输入框可以被点击和输入 */
}
.address-bar:focus {
  outline: 1px solid #0ea5e9; /* 聚焦时给个高亮 */
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar {
  position: absolute;
  top: 40px; /* 假设标题栏高度是40px */
  left: 0;
  height: 2px;
  background-color: #0ea5e9; /* 进度条颜色 */
  width: 0; /* 初始宽度为0 */
  opacity: 0; /* 初始透明 */
  transition: opacity 0.3s ease-out; /* 透明度变化的过渡 */
  z-index: 999;
}

.progress-bar.is-loading {
  opacity: 1; /* 加载时可见 */
  width: 95%; /* 模拟快速加载到95% */
  /* 关键：给宽度变化一个非常长的、平滑的过渡动画 */
  transition: width 8s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>