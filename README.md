# Ghetto Skype
Are you tired of a buggy 32 bit official Skype client? Then Ghetto Skype is for you!

Credit to [skype-unofficial-client](https://github.com/haskellcamargo/skype-unofficial-client) for coming up with this idea. His version uses node webkit whereas mine uses Electron. This means you get a few extra goodies like notifications from Electron and a tray icon.

![Screenshot](assets/screenshot.png)

## Features
- Tray Icon turns red if you have unread messages
- Native notifications from Web Skype via Electron
- Start minimized when you start your computer
- Auto login through Microsoft Account

### Pros
- Maintained
- Not as buggy as official Skype and no 32 bit dependencies
- Web Skype receives updates
- Many features not available that are not present in Linux Skype client

### Cons
- Video/Voice not yet available
- P2P file transfer doesn't work unless Skype client supports cloud storage

## Installing

#### Dependencies
For most people, you will only need npm:
```bash
# Fedora
sudo dnf install npm

# Ubuntu
sudo apt-get install npm
```

You might need this package on older versions of Ubuntu. If your tray icon is missing, it's likely because this package isn't installed on your system:
```bash
sudo apt-get install libappindicator1
```

#### Try it out

You can try it without installing by navigating a terminal to the root directory of ghetto skype and typing
```bash
npm install && npm start
```

#### Setup
By default, the installation directory is `/opt/ghetto-skype`, change this in Makefile if you want to store it elsewhere.
```bash
sudo make install

# to uninstall
# sudo make uninstall
```

#### Autostart
To automatically start Skype when you start your computer you need to link the desktop file here:
```bash
mkdir -p ~/.config/autostart
ln -s ~/.config/autostart/ghetto-skype.desktop /opt/ghetto-skype/assets/skype.desktop
```

## Settings
Settings are located in settings.json (default: `/opt/ghetto-skype/settings.json`).

| Setting          | Possible Value                    | Description
| ---------------- | --------------------------------- | ------------------------------
| StartMinimized   | true, false                       | When launched, it's hidden in the tray till you click it
| MicrosoftAccount | true, false                       | Useful if you autostart Skype. It skips the Skype login form and attempts to log you in via your Microsoft Account

## Disclaimer
The Skype name, associated trade marks and logos and the "S" logo are trade marks of Skype or related entities.
