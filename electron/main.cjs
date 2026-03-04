const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

// 调试信息
console.log('Main process starting...')
console.log('Current directory:', __dirname)

// 全局变量
let tray = null
let mainWindow = null
let browserView = null
let isWindowMaximized = false // 用于跟踪窗口最大化状态
let normalWindowBounds = null // 用于保存窗口正常状态的大小和位置

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
    resizable: true, // 启用窗口调整大小功能
    // --- macOS 特有的毛玻璃效果配置 ---
    vibrancy: 'under-window', // 开启毛玻璃效果
    visualEffectState: 'active', // 让效果更明显
    // ------------------------------------
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

  // 保存初始窗口状态
  normalWindowBounds = mainWindow.getBounds()
  console.log('Initial window bounds:', normalWindowBounds)

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
  
  // 初始化时发送当前窗口状态
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded, sending initial window state')
    isWindowMaximized = mainWindow.isMaximized()
    mainWindow.webContents.send('window-maximized', isWindowMaximized)
  })
  
  // 1. 定义标题栏的高度，这个值必须和你的CSS里的高度一致！
  const TITLEBAR_HEIGHT = 40 
  
  // 2. 创建一个BrowserView实例
  const { BrowserView } = require('electron')
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  // 3. 将 view 附加到 mainWindow 上
  mainWindow.setBrowserView(browserView)
  
  // 4. 获取主窗口内容区域的尺寸
  const [width, height] = mainWindow.getContentSize()
  
  // 5. 设置BrowserView的边界
  browserView.setBounds({ 
    x: 0, 
    y: TITLEBAR_HEIGHT, 
    width: width, 
    height: height - TITLEBAR_HEIGHT 
  })
  
  // 6. 监听窗口大小变化，调整BrowserView大小
  mainWindow.on('resize', () => {
    const [newWidth, newHeight] = mainWindow.getContentSize()
    browserView.setBounds({
      x: 0,
      y: TITLEBAR_HEIGHT,
      width: newWidth,
      height: newHeight - TITLEBAR_HEIGHT
    })
  })
  
  // 7. 让 BrowserView 加载一个外部网页
browserView.webContents.loadURL('https://cn.bing.com')
console.log('BrowserView initialized and loaded Bing')

// 设置BrowserView的事件监听器
setupViewEventListeners(browserView, mainWindow)
}

// 最好封装一个函数来获取当前激活的BrowserView
const getActiveView = () => browserView

// 最好把发送状态的逻辑也封装成函数
function sendNavigationState(view, win) {
  if (win && !win.isDestroyed() && view && !view.webContents.isDestroyed()) {
    const navState = {
      canGoBack: view.webContents.navigationHistory.canGoBack(),
      canGoForward: view.webContents.navigationHistory.canGoForward()
    }
    win.webContents.send('nav-state-change', navState)
  }
}

// 建议把这部分逻辑封装，而不是直接写在createWindow里
function setupViewEventListeners(view, win) {
  // 1. 监听"开始加载"事件
  view.webContents.on('did-start-loading', () => {
    // 当事件触发时，通过IPC向主窗口发送消息
    // 'loading-state-change'是我们自定义的频道
    // true 表示"正在加载"
    win.webContents.send('loading-state-change', true)
  })

  // 2. 监听"停止加载"事件
  view.webContents.on('did-stop-loading', () => {
    // 发送 false 表示"加载已停止"
    win.webContents.send('loading-state-change', false)
    // 别忘了在 loading 状态变化时也更新一下导航状态
    sendNavigationState(view, win)
  })

  // 当页面导航完成时（包括前进/后退/加载新页面）
  view.webContents.on('did-navigate', () => {
    sendNavigationState(view, win)
  })

  // 当页面内的哈希值变化时 (对于SPA应用很重要)
  view.webContents.on('did-navigate-in-page', () => {
    sendNavigationState(view, win)
  })
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
  console.log('Window maximize requested, current state:', isWindowMaximized)
  if (isWindowMaximized) {
    console.log('Restoring window to normal size')
    console.log('Normal window bounds:', normalWindowBounds)
    // 使用setBounds()手动设置窗口大小
    win.setBounds(normalWindowBounds)
    isWindowMaximized = false
  } else {
    console.log('Maximizing window')
    // 保存当前窗口状态，以便恢复
    normalWindowBounds = win.getBounds()
    console.log('Saved normal window bounds:', normalWindowBounds)
    win.maximize() // 最大化窗口
    isWindowMaximized = true
  }
  // 无论哪种情况，都通知渲染进程窗口状态
  setTimeout(() => {
    win.webContents.send('window-maximized', isWindowMaximized)
    // 调整BrowserView大小
    const [width, height] = win.getContentSize()
    browserView.setBounds({
      x: 0,
      y: 40,
      width: width,
      height: height - 40
    })
  }, 100) // 延迟一下，确保状态已经更新
})

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.close()
})

// 监听窗口调整大小请求
ipcMain.on('window-start-resize', (event, position) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.startResize(position)
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

// 监听浏览器刷新请求
ipcMain.on('browser-reload', (event) => {
  if (browserView) {
    browserView.webContents.reload()
    console.log('BrowserView reloaded')
  }
})

// 导航相关的IPC监听器
ipcMain.on('nav-go-back', () => getActiveView()?.webContents.goBack())
ipcMain.on('nav-go-forward', () => getActiveView()?.webContents.goForward())
ipcMain.on('nav-reload', () => getActiveView()?.webContents.reload())
ipcMain.on('nav-stop', () => getActiveView()?.webContents.stop())