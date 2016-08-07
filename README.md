# Ghetto Skype
Are you tired of a buggy 32 bit official Skype client? Then Ghetto Skype is for you!

Credit to [skype-unofficial-client](https://github.com/haskellcamargo/skype-unofficial-client) for coming up with this idea. His version uses node webkit whereas mine uses Electron. This means you get a few extra goodies like notifications from Electron.

![Screenshot](assets/screenshot.png)

## Features
- Tray Icon turns red if you have unread messages
- Native notifications from Web Skype via Electron
- Native Image Viewer can be used for previewing images
- Start minimized when you start your computer
- Run Skype through a proxy
- Auto login through Microsoft Account
- Ability to make audio calls

### Cons
- Video calls do not work and you have to initiate the audio call (if they call you, it wants you to install plugin). I'm currently looking at options to get around this.

## Installing

You can download the RPM or DEB package on the [releases page](https://github.com/stanfieldr/ghetto-skype/releases)
or you can build from source with the instructions below.

If you run Arch Linux, you can use the [AUR package](https://aur.archlinux.org/packages/ghetto-skype) techwiz24 created. Please send any issues
with the AUR package to [his repository](https://github.com/techwiz24/aur-ghetto-skype/issues).

#### Dependencies

You need a newer version of node/npm installed. If you already have node installed, please check that you are using version 6.3.1 or higher. If you have an older version installed or need to install it, I recommend installing [nvm](https://github.com/creationix/nvm) so you are not dependent on your distros version of node as it may be too old.

```bash
# To build a RPM you need this:
$ sudo dnf install rpm-build

# To build a DEB you need this:
$ sudo apt-get install fakeroot dpkg
```

#### Try it out

You can take it for a test run without installing by opening a terminal, navigating to this directory, and typing:
```bash
[u@h ghetto-skype]$ npm install && npm start
```

#### Setup

```bash
[u@h ghetto-skype]$ npm install -g grunt
[u@h ghetto-skype]$ npm install
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

## Using a Proxy

There currently isn't a way to edit this with the settings window right now. You can open `~/.config/Ghetto\ Skype/settings.json` with your favorite text editor and add your proxy to the ProxyRule setting, save, and restart
Ghetto Skype.

Example:
```bash
{
	"StartMinimized": false,
	"MicrosoftAccount": false,
	"NativeImageViewer": false,
	"ProxyRules": "socks5://46.105.6.191:5050"
}
```

## Setting Zoom Level

If the font/photos are not big enough for you, you can use the zoom factor in the `~/.config/Ghetto\ Skype/settings.json`.
This will be added to the settings screen soon.

Example 150%:
```bash
{
	"StartMinimized": false,
	"MicrosoftAccount": false,
	"NativeImageViewer": false,
	"ProxyRules": "socks5://46.105.6.191:5050",
	"ZoomFactor": 1.5
}
```

## Disclaimer
The Skype name, associated trade marks and logos and the "S" logo are trade marks of Skype or related entities.
