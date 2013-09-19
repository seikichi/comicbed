module.exports = function(grunt) {
  'use strict';
  // plugins
  grunt.loadNpmTasks("grunt-bower-task");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-handlebars");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-typescript");
  // tasks
  grunt.registerTask('setup', ['bower']);
  grunt.registerTask('default', [
    'connect:debug',
    'typescript',
    'handlebars',
    'watch'
  ]);
  grunt.registerTask('build', [
    'typescript',
    'handlebars',
    'copy',
    'uglify',
    'requirejs',
    'connect:release'
  ]);
  grunt.registerTask('server:release', ['connect:release']);
  // config
  grunt.initConfig({
    clean: ['dist', 'app/**/*.js'],
    connect: {
      debug: {
        options: {
          port: 9000,
          base: '.',
          keepalive: false
        }
      },
      release: {
        options: {
          port: 9000,
          base: 'dist/',
          keepalive: true
        }
      }
    },
    copy: {
      release: {
        files: [
          {
            src: ['index.html', 'assets/**/*'],
            dest: 'dist/',
            expand: true
          }
        ]
      }
    },
    typescript: {
      base: {
        src: ['app/**/*.ts'],
        options: {
          module: 'amd',
          base_path: '',
          sourcemap: true,
          noImplicitAny: true
        }
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: "JST",
          amd: true,
          processName: function(filepath) {
            var fileName = filepath.substring(filepath.lastIndexOf('/') + 1);
            return fileName.substring(0, fileName.indexOf('.'));
          }
        },
        files: {
          "app/templates.js": "app/templates/**/*.html"
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          mainConfigFile: "app/main.js",
          out: "dist/app/main.js",
          name: "main",
          wrap: false
        }
      }
    },
    uglify: {
      release: {
        files: {
          "dist/assets/vendor/requirejs/js/require.js": [
            "assets/vendor/requirejs/js/require.js"
          ]
        }
      }
    },
    watch: {
      typescript: {
        files: '<%= typescript.base.src %>',
        tasks: ['typescript'],
        options: {
          livereload: true
        }
      },
      templates: {
        files: 'app/templates/**/*.html',
        tasks: ['handlebars'],
        options: {
          livereload: true
        }
      }
    },
    // install
    bower: {
      install: {
        options: {
          targetDir: 'assets/vendor/',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanup: true
        }
      }
    }
  });
};
