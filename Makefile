INSTALLDIR=/opt/ghetto-skype

install:
	mkdir -p $(INSTALLDIR)
	cp -p -f -R . $(INSTALLDIR)
	npm install --prefix $(INSTALLDIR)
	sed -i -e s,/opt/ghetto-skype,$(INSTALLDIR), $(INSTALLDIR)/assets/skype.desktop
	ln -sfn $(INSTALLDIR)/assets/skype.desktop /usr/share/applications/ghetto-skype.desktop

uninstall:
	rm -rf $(INSTALLDIR)
	rm /usr/share/applications/ghetto-skype.desktop
