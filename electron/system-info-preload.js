// 系统信息预加载脚本
console.log('System info preload script starting...');

try {
  const os = require('os');
  console.log('OS module loaded successfully');
  
  // 简单的系统信息对象
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    type: os.type(),
    release: os.release(),
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB',
    getOS: function() {
      return this.type + ' ' + this.release;
    },
    getArch: function() {
      return this.arch;
    }
  };
  
  console.log('System info:', systemInfo);
  
  // 暴露API给渲染进程
  window.systemInfo = systemInfo;
  console.log('System info API exposed to window object');
  
  console.log('System info preload script finished successfully!');
} catch (error) {
  console.error('Error in preload script:', error);
  // 即使出错也创建一个基本的API对象
  window.systemInfo = {
    platform: 'error',
    arch: 'error',
    type: 'error',
    release: 'error',
    totalMemory: 'error',
    freeMemory: 'error',
    getOS: function() {
      return 'Error: ' + error.message;
    },
    getArch: function() {
      return 'Error: ' + error.message;
    }
  };
  console.log('Created fallback API due to error');
}