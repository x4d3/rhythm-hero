module.exports = function(grunt) {
	var sourceFilesPath = 'source-files.json';

	if (!grunt.file.exists(sourceFilesPath)) {
		grunt.log.error("file " + sourceFilesPath + " not found");
		return false;// return false to abort the execution
	}

	var sourceFiles = grunt.file.readJSON(sourceFilesPath);

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean : [ "target" ],
		copy : {
			dev : {
				files : [ {
					expand : true,
					cwd : 'www/',
					src : [ '**' ],
					dest : 'target/'
				} ]
			}
		},
		concat : {
			options : {
				separator : '\n',
				process : function(src, filepath) {
					return '//' + filepath + '\n' + src;
				}
			},
			dist : {
				src : sourceFiles.map(function(path) {
					return "src/" + path;
				}),
				dest : 'target/script.js'
			}
		},
		qunit : {
			files : [ 'tests/**/*test.html' ]
		},
		jshint : {
			files : [ 'Gruntfile.js', 'src/*.js', 'tests/*.js' ],
			options : {
				// options here to override JSHint defaults
				globals : {
					jQuery : true,
					console : true,
					module : true,
					document : true,
					RH : true
				}
			}
		},
		watch : {
			scripts : {
				files : [ '<%= jshint.files %>' ],
				tasks : [ 'jshint', 'concat', 'qunit' ],
				options : {
					livereload : true
				}
			},
			html : {
				files : [ 'www/*' ],
				tasks : [ 'clean', 'copy', 'jshint', 'concat', 'qunit' ],
				options : {
					livereload : true
				}
			}

		},
		connect : {
			server : {
				options : {
					port : 4000,
					base : 'target',
					hostname : '*'
				}
			}
		},
		uglify : {
			dist : {
				files : {
					'target/script.js' : [ 'target/script.js' ]
				}
			}
		},
		cssmin : {
			dist : {
				files : {
					'target/style.css' : [ 'target/style.css' ]
				}
			}
		},
		htmlmin : {
			options : {
				removeComments : true,
				collapseWhitespace : true
			},
			dist : {
				files : {
					'target/index.html' : 'target/index.html'
				}
			}
		},
		appcache : {
			options : {
				basePath : 'target'
			},
			all : {
				dest : 'target/manifest.appcache',
				cache : 'target/**/*'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-appcache');

	grunt.registerTask('test', [ 'clean', 'copy', 'jshint', 'concat', 'qunit' ]);
	grunt.registerTask('default', [ 'test', 'connect', 'watch' ]);
	grunt.registerTask('stage', [ 'test', 'uglify', 'cssmin', 'htmlmin', 'appcache' ]);
	grunt.registerTask('stage-test', [ 'stage', 'connect', 'watch' ]);
};