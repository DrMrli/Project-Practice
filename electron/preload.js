// electron/preload.js

const { contextBridge, ipcRenderer } = require('electron')

// 我们将所有要暴露的API都放在 'myAPI' 这个命名空间下
contextBridge.exposeInMainWorld('myAPI', {
  /**
   * 功能：单向通信 - 发送一个系统通知
   * 用法：在Vue组件里调用 window.myAPI.sendNotification('一些消息')
   * @param {string} message - 要在通知里显示的内容
   */
  sendNotification: (message) => {
    // 使用 'show-notification' 这个我们自己定义的频道名
    // 将消息发送到主进程
    ipcRenderer.send('show-notification', message)
  },

  /**
   * 功能：双向通信 - 从主进程获取应用的版本号
   * 用法：在Vue组件里 const version = await window.myAPI.getAppVersion()
   * @returns {Promise<string>} - 返回一个包含版本号字符串的Promise
   */
  getAppVersion: () => {
    // 使用 'get-app-version' 这个频道名
    // invoke 会等待主进程的 handle 回复
    return ipcRenderer.invoke('get-app-version')
  },

    // --- 新增这三个方法 (都是单向通信，因为不需要回复) ---
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  // --------------------------------------------------------
})