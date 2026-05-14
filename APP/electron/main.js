const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend');
  backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: backendPath,
    env: { ...process.env },
  });

  backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`[backend] ${data}`));
  backendProcess.on('close', (code) => console.log(`[backend] exited with code ${code}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Album Pipeline',
    backgroundColor: '#0d0c12',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In dev, load from Next.js dev server; in prod, load built files
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'out', 'index.html'));
  }
}

app.whenReady().then(() => {
  startBackend();
  // Give backend a moment to start
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});
