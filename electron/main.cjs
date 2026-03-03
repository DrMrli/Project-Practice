const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

// 调试信息
console.log('Main process starting...')
console.log('Current directory:', __dirname)

// 全局变量
let tray = null
let mainWindow = null
let browserView = null

// 预加载脚本路径
const preloadPath = path.join(__dirname, 'preload.js') 
console.log('Preload script path:', preloadPath)

function createWindow() {
  console.log('Creating window...')
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // 隐藏默认窗口边框和标题栏
    transparent: true, // 这是实现自定义阴影的前提
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

  // 监听窗口事件
  mainWindow.on('closed', () => {
    console.log('Window closed')
  })
  
  // 监听窗口关闭事件，改为隐藏窗口而不是退出应用
  mainWindow.on('close', (event) => {
    // 阻止默认的关闭行为
    event.preventDefault()
    // 隐藏窗口
    mainWindow.hide()
    console.log('Window hidden instead of closed')
  })

  mainWindow.on('ready-to-show', () => {
    console.log('Window ready to show')
    mainWindow.show()
  })

  // 让这个窗口去加载我们Vite项目的网页地址
  console.log('Loading URL: http://localhost:5173')
  mainWindow.loadURL('http://localhost:5173')
  
  // 隐藏主窗口的webContents，只显示BrowserView
  mainWindow.webContents.on('did-finish-load', () => {
    // 主窗口加载完成后，确保BrowserView可见
    if (browserView) {
      mainWindow.setBrowserView(browserView)
    }
  })
  
  // 关闭开发者工具，正常显示应用
  // mainWindow.webContents.openDevTools()
  
  // 监听preload脚本错误
  mainWindow.webContents.on('preload-error', (event, error) => {
    console.error('Preload script error:', error)
  })
  
  // 监听导航完成
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully')
  })
  
  // 监听导航错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription)
  })
  
  // 监听窗口最大化事件
  mainWindow.on('maximize', () => {
    console.log('Window maximized')
    // 通知渲染进程窗口已最大化
    mainWindow.webContents.send('window-maximized', true)
  })
  
  // 监听窗口还原事件
  mainWindow.on('unmaximize', () => {
    console.log('Window unmaximized')
    // 通知渲染进程窗口已还原
    mainWindow.webContents.send('window-maximized', false)
  })
  
  // 初始化时发送当前窗口状态
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded, sending initial window state')
    mainWindow.webContents.send('window-maximized', mainWindow.isMaximized())
  })
  
  // 初始化BrowserView用于加载外部网页
  const { BrowserView } = require('electron')
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  // 将BrowserView添加到窗口
  mainWindow.addBrowserView(browserView)
  
  // 设置BrowserView的位置和大小（位于标题栏下方，且有边距）
  const titleBarHeight = 40 // 标题栏高度
  const padding = 1 // 与#app的padding一致
  const { width, height } = mainWindow.getBounds()
  browserView.setBounds({
    x: padding,
    y: padding + titleBarHeight,
    width: width - padding * 2,
    height: height - padding * 2 - titleBarHeight
  })
  
  // 监听窗口大小变化，调整BrowserView大小
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds()
    browserView.setBounds({
      x: padding,
      y: padding + titleBarHeight,
      width: width - padding * 2,
      height: height - padding * 2 - titleBarHeight
    })
  })
  
  // 初始加载一个默认页面
  browserView.webContents.loadURL('https://www.baidu.com')
  console.log('BrowserView initialized and loaded Baidu')
}

// 当Electron平台准备就绪后，就执行创建窗口的指令
app.whenReady().then(() => {
  createWindow() // 创建窗口

  // 创建系统托盘
  console.log('Creating system tray...')
  
  try {
    // 使用PNG格式的图标创建托盘
    console.log('Creating tray with PNG icon...')
    
    // 图标路径：__dirname是electron目录，../回到根目录，再进入resources
    const iconPath = path.join(__dirname, '../resources/icon.png')
    console.log('Tray icon path:', iconPath)
    
    tray = new Tray(iconPath)
    console.log('Tray created successfully with PNG icon')
    
    // 设置鼠标悬浮在托盘图标上时显示的文字
    tray.setToolTip('IntelliView 浏览器 - 我在这里！')
    
    // 设置托盘图标的标题（仅macOS）
    tray.setTitle('IntelliView')
    
    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏',
        click: () => {
          // 点击后，切换窗口的显示和隐藏
          mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        }
      },
      {
        type: 'separator' // 这是一条分割线
      },
      {
        label: '退出',
        click: () => {
          // 确保应用能够真正退出
          console.log('Exiting application...')
          // 先销毁窗口
          if (mainWindow) {
            mainWindow.destroy()
          }
          // 然后退出应用
          app.quit()
        }
      }
    ])
    
    // 设置托盘菜单
    tray.setContextMenu(contextMenu)
    
    // 点击托盘图标显示/隐藏窗口
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
        }
      }
    })
    
    console.log('Tray initialized with menu')
  } catch (error) {
    console.error('Failed to create tray:', error)
  }
})

// --- 在这里添加新的IPC监听器 ---

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

// --- 在文件末尾新增这三个监听器 ---
ipcMain.on('window-minimize', (event) => {
  // 通过 event.sender 获取到发送该消息的窗口
  const win = BrowserWindow.fromWebContents(event.sender)
  win.minimize()
})

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win.isMaximized()) {
    win.unmaximize() // 如果已经是最大化，就恢复
  } else {
    win.maximize() // 否则就最大化
  }
})

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.close()
})

// 智能翻译官：URL规范化函数
function normalizeURL(url) {
  if (!url) return null

  // 如果已经是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 如果像域名（但不包含协议），自动补全 https://
  if (url.includes('.') && !url.includes(' ')) {
    return `https://${url}`
  }

  // 否则，当作搜索引擎的关键词进行搜索
  // 使用 encodeURIComponent 来处理中文或特殊字符
  return `https://www.bing.com/search?q=${encodeURIComponent(url)}`
}

// 定义安全的协议白名单
const SAFE_PROTOCOLS = ['https:', 'http:']

// 监听浏览器导航请求
ipcMain.handle('browser-load-url', (event, url) => {
  console.log('Received URL:', url)
  const normalizedUrl = normalizeURL(url)
  
  if (!normalizedUrl) {
    console.error('Invalid URL:', url)
    return { success: false, error: 'Invalid URL' }
  }

  try {
    const urlObject = new URL(normalizedUrl)

    // --- 开始安检 ---
    if (!SAFE_PROTOCOLS.includes(urlObject.protocol)) {
      console.error(`拦截到不安全的协议: ${urlObject.protocol}`)
      return { success: false, error: `Unsafe protocol: ${urlObject.protocol}` }
    }
    // --- 安检结束 ---

    // 使用browserView加载URL，保留标题栏
    if (browserView) {
      browserView.webContents.loadURL(normalizedUrl)
      console.log('Loading normalized URL in BrowserView:', normalizedUrl)
      return { success: true, url: normalizedUrl }
    } else {
      console.error('BrowserView not initialized')
      return { success: false, error: 'BrowserView not initialized' }
    }
  } catch (error) {
    console.error('Invalid URL:', normalizedUrl, error)
    return { success: false, error: error.message }
  }
})