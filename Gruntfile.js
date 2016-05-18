const os = require('os');

// Possible values: x64, ia32
let arch = os.arch();

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		'electron-packager': {
			build: {
				options: {
					platform: os.platform(),
					arch: arch,
					dir: '.',
					out: './build',
					icon: './assets/tray/skype.png',
					ignore: ['build', 'dist'],
					overwrite: true
				}
			}
		},

		'electron-installer-redhat': {
			linux: {
				options: {
					bin: './Ghetto Skype',
					icon: "./assets/tray/skype.png",
					arch: arch === 'x64' ? 'x86_64' : 'x86'
				},

				src: 'build/Ghetto Skype-linux-' + arch + '/',
				dest: 'dist/'
			}
		},

		'electron-installer-debian': {
			linux: {
				options: {
					bin: './Ghetto Skype',
					icon: "./assets/tray/skype.png",
					arch: arch === 'x64' ? 'amd64' : 'i386',
					depends: [
						'libappindicator1'
					]
				},

				src: 'build/Ghetto Skype-linux-' + arch + '/',
				dest: 'dist/'
			}
		}
	});

	grunt.registerTask('build', ['electron-packager:build']);
	grunt.registerTask('rpm', ['build', 'electron-installer-redhat']);
	grunt.registerTask('deb', ['build', 'electron-installer-debian']);

	grunt.registerTask('default', ['build']);
};
