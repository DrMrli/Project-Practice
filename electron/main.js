import { app, BrowserWindow } from 'electron'
import path from 'path'

function createWindow() {
  // 创建一个800x600的浏览器窗口 (产品展厅)
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // 在这里可以添加更多窗口配置
  })

  // 让这个窗口去加载我们Vite项目的网页地址
  mainWindow.loadURL('http://localhost:5173')
}

// 当Electron平台准备就绪后，就执行创建窗口的指令
app.whenReady().then(createWindow)