import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { AuthManager } from '../auth/manager';

let loginWindow: BrowserWindow | null = null;

export function showLoginWindow(authManager: AuthManager): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loginWindow) {
      loginWindow.focus();
      return;
    }

    let completed = false;

    loginWindow = new BrowserWindow({
      width: 420,
      height: 520,
      resizable: false,
      modal: true,
      show: false,
      autoHideMenuBar: true,
      title: 'InTime Productivity Agent - Sign In',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    const loginHtmlPath = path.join(__dirname, '../../assets/login.html');
    loginWindow.loadFile(loginHtmlPath);

    loginWindow.once('ready-to-show', () => {
      loginWindow?.show();
    });

    const handler = async (_event: Electron.IpcMainInvokeEvent, payload: { email: string; password: string; remember: boolean; }) => {
      try {
        const email = payload.email?.trim();
        const password = payload.password;
        const remember = payload.remember;

        if (!email || !password) {
          return { success: false, message: 'Email and password are required' };
        }

        await authManager.loginWithCredentials(email, password, remember);
        completed = true;
        loginWindow?.close();
        resolve();
        return { success: true };
      } catch (error: any) {
        const message = error?.message || 'Failed to sign in. Please try again.';
        return { success: false, message };
      }
    };

    ipcMain.handle('login:attempt', handler);

    loginWindow.on('closed', () => {
      loginWindow = null;
      ipcMain.removeHandler('login:attempt');
      if (!completed) {
        reject(new Error('Login window closed before authentication.'));
      }
    });
  });
}


