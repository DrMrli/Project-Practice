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
  }
})

// 创建一个新的命名空间叫 windowControls，专门用来放窗口控制相关的API
contextBridge.exposeInMainWorld('windowControls', {
  // 定义一个名为'minimize'的API
  // 当Vue调用它时，它会通过'window-minimize'频道发送一个单向消息
  minimize: () => ipcRenderer.send('window-minimize'),
  
  // 定义'maximize' API
  maximize: () => ipcRenderer.send('window-maximize'),
  
  // 定义'close' API
  close: () => ipcRenderer.send('window-close'),
  
  // 定义'startResize' API
  startResize: (position) => ipcRenderer.send('window-start-resize', position),
  
  // 监听窗口状态变化
  onWindowMaximized: (callback) => {
    // 接收来自主进程的窗口最大化状态消息
    ipcRenderer.on('window-maximized', (event, isMaximized) => {
      callback(isMaximized)
    })
  }
})

// 创建一个新的命名空间叫 browser，专门用来放浏览器相关的API
contextBridge.exposeInMainWorld('browser', {
  // 使用invoke，因为未来我们可能需要主进程返回加载状态（成功/失败）
  loadURL: (url) => ipcRenderer.invoke('browser-load-url', url),
  
  // 刷新当前页面
  reload: () => ipcRenderer.send('browser-reload'),
  
  // 封装一个用于接收主进程消息的API
  // 它接收一个回调函数作为参数
  onLoadingStateChange: (callback) => {
    // 使用 ipcRenderer.on 来监听主进程发来的消息
    ipcRenderer.on('loading-state-change', (event, isLoading) => {
      // 收到消息后，调用传入的回调函数，并将isLoading状态传给Vue
      callback(isLoading)
    })
  }
})