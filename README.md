# Ghetto Skype
Are you tired of a buggy 32 bit official Skype client? Then Ghetto Skype is for you!

Credit to [skype-unofficial-client](https://github.com/haskellcamargo/skype-unofficial-client) for coming up with this idea. His version uses node webkit whereas mine uses Electron. This means you get a few extra goodies like notifications from Electron and a tray icon.

![Screenshot](assets/screenshot.png)

## Features
- Tray Icon turns red if you have unread messages
- Native notifications from Web Skype via Electron
- Native Image Viewer can be used for previewing images
- Start minimized when you start your computer
- Auto login through Microsoft Account

### Cons
- Video/Voice not yet available
- P2P file transfer doesn't work unless Skype client supports cloud storage

## Installing

#### Try it out

You can take it for a test run without installing by opening a terminal, navigating to this directory, and typing:
```bash
[u@h ghetto-skype]$ npm install && npm start
```

#### Dependencies

You will need npm installed, I recommend [nvm](https://github.com/creationix/nvm) so you have the ability to use multiple node versions. It also fixes a common permission issue so you do not have to use sudo. However, if you have npm installed through your distro, that's all you need.

```bash
# To build a RPM you need this:
$ sudo dnf install rpm-build

# To build a DEB you need this:
$ sudo apt-get install fakeroot dpkg
```

#### Setup

```bash
[u@h ghetto-skype]$ npm install -g grunt
[u@h ghetto-skype]$ grunt rpm # makes package for rpm distros
[u@h ghetto-skype]$ grunt deb # makes package for deb distros

# After packages built they will be located here...
[u@h ghetto-skype]$ cd dist && ls
```

If your distro does not use RPM or DEB packages, you can build it like so:
```bash
[u@h ghetto-skype]$ grunt # Creates the build

# Example of possible steps to do with your build:
[root@h ghetto-skype]# cp -r build/Ghetto* /opt/ghetto-skype
[root@h ghetto-skype]# ln -s /opt/ghetto-skype/assets/skype.desktop /usr/share/applications/ghetto-skype.desktop
```
The build is placed in the build directory and then by cpu type. By default it detects 32/64 bit based on the system you build the package with. However, you can modify `Gruntfile.js` accordingly if need be.

## Disclaimer
The Skype name, associated trade marks and logos and the "S" logo are trade marks of Skype or related entities.
