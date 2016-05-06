# Ghetto Skype
Are you tired of a buggy 32 bit official Skype client? Then Ghetto Skype is for you!

## Installing

First please make sure you have node and npm installed.

```bash
# By default, the installation directory is `/opt/ghetto-skype`.
# Change this in Makefile if you want to store it elsewhere before running.
sudo make install

# to uninstall
# sudo make uninstall
```

You may delete this folder after you run `make install`, you can run `make uninstall` from the installation directory after you trash this one.

If you need to update, it is recommended to `git pull` in the installation directory. This way you keep your settings file and are alerted of any conflicts if settings have changed.

Here are a few options that can be set in `settings.json`:

- StartMinimized - When skype is launched, it's hidden in the tray till you click it
- MicrosoftAccount - By pass skype login form and proceeds to login or ask for Microsoft credentials.

Remember, edit the settings in the installation directory, not the folder you downloaded!

## Features
- Tray Icon turns red if you have unread messages
- Native notifications from Web Skype via Electron
- Auto login through Microsoft Account

![Screenshot](assets/screenshot.png)

## Disclaimer
The Skype name, associated trade marks and logos and the "S" logo are trade marks of Skype or related entities.
