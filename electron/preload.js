// electron/preload.js
console.log('Preload script starting...')

try {
  const os = require('os')
  console.log('OS module loaded successfully')
  
  // 测试 os 模块
  console.log('OS platform:', os.platform())
  console.log('OS arch:', os.arch())
  
  // 直接在 window 对象上添加 API
  window.myAPI = {
    getOS: function() {
      console.log('getOS called')
      return os.platform()
    },
    getArch: function() {
      console.log('getArch called')
      return os.arch()
    }
  }
  
  console.log('API exposed directly on window object!')
  console.log('window.myAPI:', window.myAPI)
  console.log('Preload script finished successfully!')
} catch (error) {
  console.error('Error in preload script:', error)
  // 即使出错也创建一个基本的API对象
  window.myAPI = {
    getOS: function() {
      return 'error: ' + error.message
    },
    getArch: function() {
      return 'error: ' + error.message
    }
  }
  console.log('Created fallback API due to error')
}