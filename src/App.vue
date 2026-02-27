<script setup>
import { ref, onMounted } from 'vue'

const myOS = ref('正在查询...')
const myArch = ref('正在查询...')
const systemInfo = ref({})
const debugInfo = ref('')

onMounted(() => {
  console.log('App mounted, checking APIs...')
  console.log('window object:', window)
  console.log('window.systemInfo:', window.systemInfo)
  
  debugInfo.value = `window.systemInfo: ${typeof window.systemInfo}`
  
  // 检查注入的 systemInfo API
  if (window.systemInfo) {
    console.log('systemInfo found!')
    console.log('systemInfo:', window.systemInfo)
    
    try {
      myOS.value = `我的操作系统是：${window.systemInfo.getOS()}`
      myArch.value = `我的CPU架构是：${window.systemInfo.getArch()}`
      // 检查是否有getAllInfo方法
      if (window.systemInfo.getAllInfo) {
        systemInfo.value = window.systemInfo.getAllInfo()
      } else {
        // 如果没有getAllInfo方法，直接使用systemInfo对象
        systemInfo.value = window.systemInfo
      }
    } catch (error) {
      console.error('Error accessing systemInfo API:', error)
      myOS.value = '访问API时出错'
    }
  } else {
    console.log('No systemInfo API found!')
    myOS.value = '无法访问系统API'
  }
})
</script>

<template>
  <div class="info-card">
    <h1>电脑信息</h1>
    <p>{{ myOS }}</p>
    <p>{{ myArch }}</p>
    <div v-if="Object.keys(systemInfo).length > 0" class="detailed-info">
      <h2>详细信息</h2>
      <p>平台: {{ systemInfo.platform }}</p>
      <p>类型: {{ systemInfo.type }}</p>
      <p>版本: {{ systemInfo.release }}</p>
      <p>内存总量: {{ systemInfo.totalMemory }}</p>
      <p>可用内存: {{ systemInfo.freeMemory }}</p>
    </div>
    <p class="debug">{{ debugInfo }}</p>
  </div>
</template>

<style scoped>
.info-card {
  background: #f0f9ff;
  border-left: 5px solid #0ea5e9;
  padding: 20px;
  margin: 50px;
  border-radius: 8px;
  text-align: center;
  font-family: sans-serif;
  color: #000;
}

.detailed-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: left;
  color: #000;
}

.debug {
  margin-top: 20px;
  font-size: 12px;
  color: #666;
  font-family: monospace;
}
</style>