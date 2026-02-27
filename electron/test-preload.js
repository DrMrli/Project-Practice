// 测试 preload 脚本
console.log('Test preload script loaded!')

// 直接暴露简单的 API
window.testAPI = {
  message: 'Hello from preload!',
  getInfo: function() {
    return 'Test API is working!'
  }
}

console.log('Test API exposed:', window.testAPI)