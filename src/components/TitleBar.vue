<template>
  <header class="titlebar">
    <!-- 左侧区域 -->
    <div class="titlebar-left">
      <img src="/vite.svg" alt="Logo" class="logo" />
      <span class="title">IntelliView Browser</span>
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

// 组件挂载时注册窗口状态变化监听器
onMounted(() => {
  // 注册监听器，接收来自主进程的窗口状态消息
  window.windowControls.onWindowMaximized((maximized) => {
    console.log('Window maximized status changed:', maximized)
    isMaximized.value = maximized
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
</style>