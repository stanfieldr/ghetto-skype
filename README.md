# Ghetto Skype
Are you tired of a dinosaur program? Do you hate clicking picture links? Does Skype for Linux randomly show people going offline and downright being unreliable? Then Ghetto Skype is for you!

## Installing

First please make sure you have node and npm installed first.

```bash
sudo make install

# to uninstall
# sudo make uninstall
```

If you need to update, it is recommended to `git pull` in the installation directory (default is `/opt/ghetto-skype`). This way you keep your settings file and are alerted of any conflicts if settings have changed.

Here are a few options that can be set in `settings.json`:
1. startMinimized - When skype is launched, it's hidden in the tray till you click it
2. microsoftAccount - By pass skype login form and proceeds to login or ask for Microsoft credentials.

Remember, edit the settings in the installation directory, not the folder you downloaded!

## Features
- Tray Icon turns red if you have unread messages
- Native notifications from Web Skype via Electron
- Auto login through Microsoft Account

![Screenshot](screenshot.png)

## Disclaimer
The Skype name, associated trade marks and logos and the "S" logo are trade marks of Skype or related entities.
