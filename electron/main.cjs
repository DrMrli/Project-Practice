const { app, BrowserWindow } = require('electron')
const path = require('path')

// 调试信息
console.log('Main process starting...')
console.log('Current directory:', __dirname)

// 预加载脚本路径
const preloadPath = path.join(__dirname, 'preload.js') 
console.log('Preload script path:', preloadPath)

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // --- 这是我们要修改的核心部分 ---
      // 1. 重新开启上下文隔离，这是安全的基石！
      contextIsolation: true,
      // 2. 关闭Node集成，渲染进程不能直接用 require()
      nodeIntegration: false,
      // 3. 指定我们的 preload 脚本
      preload: preloadPath
      // ------------------------------------
    }
  })


  // 让这个窗口去加载我们Vite项目的网页地址
  mainWindow.loadURL('http://localhost:5173')
  
  // 打开开发者工具，方便调试
  mainWindow.webContents.openDevTools()
  
  // 监听preload脚本错误
  mainWindow.webContents.on('preload-error', (event, error) => {
    console.error('Preload script error:', error)
  })
}

// 当Electron平台准备就绪后，就执行创建窗口的指令
app.whenReady().then(createWindow)

// --- 在这里添加新的IPC监听器 ---

// 1. 引入 Notification 模块，用于显示通知
const { ipcMain, Notification } = require('electron') // 您可以把它合并到文件顶部的require里

/**
 * 监听单向通信：处理 'show-notification' 频道
 * 当渲染进程调用 myAPI.sendNotification 时，这里的代码会被触发
 */
ipcMain.on('show-notification', (event, message) => {
  // 创建一个系统通知并显示
  new Notification({
    title: 'IntelliView 通知',
    body: message
  }).show()
})

/**
 * 监听双向通信：处理 'get-app-version' 频道
 * 当渲染进程调用 myAPI.getAppVersion 时，这里的代码会被触发
 */
ipcMain.handle('get-app-version', () => {
  // 使用 app.getVersion() 获取 package.json 中的版本号
  const version = app.getVersion()
  // handle 的回调必须有返回值，这个值会通过Promise返回给渲染进程
  return version
})
// ---------------------------------