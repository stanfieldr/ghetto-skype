INSTALLDIR=/opt/ghetto-skype

install:
	mkdir -p $(INSTALLDIR)
	cp -p -f -R . $(INSTALLDIR)
	npm install --prefix $(INSTALLDIR)
	ln -s $(INSTALLDIR)/skype.desktop /usr/share/applications/skype.desktop

uninstall:
	rm -rf $(INSTALLDIR)
	rm /usr/share/applications/skype.desktop
