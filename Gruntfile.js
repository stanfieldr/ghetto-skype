const os = require('os');

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		'electron-packager': {
			build: {
				options: {
					platform: os.platform(),
					arch: os.arch(),
					dir: '.',
					out: './build',
					icon: './assets/tray/skype.png',
					overwrite: true
				}
			}
		},

		'electron-installer-redhat': {
			linux: {
				options: {
					bin: './Ghetto Skype',
					icon: "./assets/tray/skype.png",
					arch: os.arch() === 'x64' ? 'x86_64' : 'x86'
				},

				src: 'build/Ghetto Skype-linux-' + os.arch() + '/',
				dest: 'dist/'
			}
		},

		'electron-installer-debian': {
			linux: {
				options: {
					bin: './Ghetto Skype',
					icon: "./assets/tray/skype.png",
					arch: os.arch() === 'x64' ? 'amd64' : 'i386',
					depends: [
						'libappindicator1'
					]
				},

				src: 'build/Ghetto Skype-linux-' + os.arch() + '/',
				dest: 'dist/'
			}
		}
	});

	grunt.registerTask('build', ['electron-packager:build']);
	grunt.registerTask('rpm', ['build', 'electron-installer-redhat']);
	grunt.registerTask('deb', ['build', 'electron-installer-debian']);

	grunt.registerTask('default', ['build']);
};
