<template>
  <header class="titlebar">
    <!-- 左侧区域 -->
    <div class="titlebar-left">
      <img src="/vite.svg" alt="Logo" class="logo" />
      <span class="title">IntelliView Browser</span>
    </div>

    <!-- 中间自适应区域 -->
    <div class="titlebar-center">
      <!-- 这里是可拖拽区域，现在是空的 -->
    </div>

    <!-- 右侧控制区域 -->
    <div class="titlebar-right">
      <div class="win-control" @click="minimize">
        <!-- 最小化图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 11H4v2h16z"/></svg>
      </div>
      <div class="win-control" @click="maximize">
        <!-- 最大化图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 4h16v16H4z"/></svg>
      </div>
      <div class="win-control close" @click="close">
        <!-- 关闭图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  </header>
</template>

<script setup>
// 窗口控制逻辑
const minimize = () => window.myAPI.minimizeWindow()
const maximize = () => window.myAPI.maximizeWindow()
const close = () => window.myAPI.closeWindow()
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.titlebar-left,
.titlebar-right {
  /* 将左右区域内部也变成Flex容器，方便对齐图标和文字 */
  display: flex;
  align-items: center;
  gap: 8px; /* 元素之间的间距 */
  
  /* 将左右两个区域明确标记为不可拖拽，以保证内部的按钮可以被点击 */
  -webkit-app-region: no-drag;
}

.titlebar-center {
  /* 4. 关键中的关键！让中间区域自动长大，填满所有剩余空间 */
  flex-grow: 1;
  
  height: 100%; /* 高度撑满 */
  margin: 0 8px; /* 左右边距 */

  /* 指定拖拽区域 */
  -webkit-app-region: drag;
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
  cursor: pointer;
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
</style>