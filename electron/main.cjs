const { app, BrowserWindow } = require('electron')
const path = require('path')

// 调试信息
console.log('Main process starting...')
console.log('Current directory:', __dirname)

// 预加载脚本路径
const preloadPath = path.resolve(__dirname, 'simple-preload.js')
console.log('Preload script path:', preloadPath)

function createWindow() {
  // 创建一个800x600的浏览器窗口 (产品展厅)
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // 在这里可以添加更多窗口配置
    webPreferences: {
      contextIsolation: false, // 暂时禁用上下文隔离
      nodeIntegration: true, // 启用Node集成以便测试
      preload: preloadPath // 使用简单的预加载脚本
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