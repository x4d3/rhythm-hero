module.exports = function(grunt) {
    var SOURCE_FILES = [
    'rh.js',
	'vex-utils.js',
    'event-manager.js',
    'game.js',
    'application.js'
    ];
    
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["target"],
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'www/',
                    src: ['**'],
                    dest: 'target/'
                }]
            }
        },
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: SOURCE_FILES.map(function(path){return "src/" + path;}),
                dest: 'target/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'target/<%= pkg.name %>.min.js': [
                        '<%= concat.dist.dest %>'
                    ]
                }
            }
        },
        qunit: {
            files: ['tests/**/*.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true,
                    RH:true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'concat', 'uglify', 'qunit'],
            options: { livereload: true }
        },
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: 'target',
                    hostname: '*'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('test', ['clean', 'copy', 'jshint', 'concat', 'uglify', 'qunit']);
    grunt.registerTask('default', ['clean', 'copy','jshint', 'concat', 'uglify', 'qunit', 'connect', 'watch']);
};