const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const https = require('https');

let flaskProcess;

function ensureAppDataFolder() {
  const userDataPath = app.getPath('userData');
  const appDataFolder = path.join(userDataPath, 'JarroBox_data');

  if (!fs.existsSync(appDataFolder)) {
    fs.mkdirSync(appDataFolder, { recursive: true });
  }

  return appDataFolder;
}

function copyBackendFiles() {
  const userDataPath = app.getPath('userData');
  const backendPath = path.join(userDataPath, 'JarroBox_data', 'backend');
  const sourceBackendPath = path.join(__dirname, 'backend');

  if (!fs.existsSync(backendPath)) {
    fs.mkdirSync(backendPath, { recursive: true });

    fs.readdirSync(sourceBackendPath).forEach(file => {
      const sourceFile = path.join(sourceBackendPath, file);
      const destinationFile = path.join(backendPath, file);
      fs.copyFileSync(sourceFile, destinationFile);
    });
  }
}

function checkPythonInstallation() {
  return new Promise((resolve, reject) => {
    exec('python --version', (error, stdout, stderr) => {
      if (error || stderr.includes('not recognized')) {
        exec('python3 --version', (error, stdout, stderr) => {
          if (error || stderr.includes('not recognized')) {
            reject('Python não encontrado');
          } else {
            resolve(stdout);
          }
        });
      } else {
        resolve(stdout);
      }
    });
  });
}

function downloadAndInstallPython() {
  return new Promise((resolve, reject) => {
    const pythonInstallerUrl = 'https://www.python.org/ftp/python/3.10.6/python-3.10.6.exe';
    const installerPath = path.join(app.getPath('userData'), 'python-installer.exe');

    const file = fs.createWriteStream(installerPath);

    https.get(pythonInstallerUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          exec(installerPath, (err, stdout, stderr) => {
            if (err) {
              reject(`Erro ao executar o instalador: ${err.message}`);
            } else {
              resolve();
            }
          });
        });
      });
    }).on('error', (err) => {
      reject(`Erro ao baixar o instalador: ${err.message}`);
    });
  });
}

function installFlaskDependencies() {
  const pythonPath = 'python';
  const userDataPath = app.getPath('userData');
  const installScriptPath = path.join(userDataPath, 'JarroBox_data', 'backend', 'install_flask_dependencies.py');

  const installProcess = spawn(pythonPath, [installScriptPath]);

  installProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  installProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      startFlaskServer();
    } else {
      dialog.showErrorBox('Erro', 'Erro ao instalar as dependências do Flask.');
    }
  });
}

function startFlaskServer() {
  const userDataPath = app.getPath('userData');
  const flaskScriptPath = path.join(userDataPath, 'JarroBox_data', 'backend', 'index.py');

  flaskProcess = spawn('python', [flaskScriptPath]);

  flaskProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    if (data.toString().includes("Running on")) {
      console.log("Flask server started successfully.");
      dialog.showMessageBox({
        type: 'info',
        message: 'Flask server is running!',
        buttons: ['OK']
      });
    }
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  flaskProcess.on('close', (code) => {
    console.log(`Flask server process exited with code ${code}`);
    if (code !== 0) {
      dialog.showErrorBox('Erro', 'O servidor Flask falhou ao iniciar.');
    }
  });
}

app.whenReady().then(async () => {
  try {
    copyBackendFiles();

    await checkPythonInstallation();
    installFlaskDependencies();
  } catch (error) {
    try {
      await downloadAndInstallPython();
      installFlaskDependencies();
    } catch (installError) {
      dialog.showErrorBox('Erro', 'Ocorreu um erro ao tentar instalar o Python. Verifique sua conexão com a internet e tente novamente.');
    }
  }

  ensureAppDataFolder();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'imagens', 'icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  Menu.setApplicationMenu(null);
}