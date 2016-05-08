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

		'electron-redhat-installer': {
			linux: {
				options: {
					bin: './Ghetto Skype',
					icon: "./assets/tray/skype.png",
					arch: os.arch() === 'x64' ? 'x86_64' : 'x86'
				},

				src: 'build/Ghetto Skype-linux-' + os.arch() + '/',
				dest: 'dist/'
			}
		}
	});

	grunt.registerTask('default', ['electron-packager:build', 'electron-redhat-installer']);
};
