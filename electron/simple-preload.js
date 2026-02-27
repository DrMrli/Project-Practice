// 简单的预加载脚本
console.log('Simple preload script starting...');

// 引入os模块获取实际系统信息
const os = require('os');

// 实时获取系统信息
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

// 暴露API给渲染进程
window.systemInfo = systemInfo;

console.log('System info API exposed to window object:', window.systemInfo);
console.log('Simple preload script finished!');