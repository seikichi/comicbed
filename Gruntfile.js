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
  grunt.loadNpmTasks("grunt-preprocess");
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
    'preprocess',
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
          port: 9001,
          base: 'dist/',
          keepalive: true
        }
      }
    },
    preprocess: {
      release: {
        src: ['dist/index.html', 'app/utils/logger.js'],
        options: {
          inline: true,
          context: {}
        }
      }
    },
    copy: {
      release: {
        files: [
          {
            src: [
              'index.html',
              'assets/app/pdfjs/js/pdf.worker.js',
              'assets/app/css/**/*',
              'assets/app/jquery-mobile/css/**/*',
            ],
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
          noImplicitAny: true,
          comments: true
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
          baseUrl: 'app',
          mainConfigFile: "app/config.js",
          out: "dist/app/main.js",
          name: 'main',
          wrap: false,
          findNestedDependencies: true
        }
      },
      pdf_unarchiver: {
        options: {
          baseUrl: 'app',
          mainConfigFile: "app/config.js",
          out: "dist/app/models/pdf_unarchiver.js",
          name: 'models/pdf_unarchiver',
          wrap: false
        }
      },
      zip_unarchiver: {
        options: {
          baseUrl: 'app',
          mainConfigFile: "app/config.js",
          out: "dist/app/models/zip_unarchiver.js",
          name: 'models/zip_unarchiver',
          wrap: false
        }
      },
      rar_unarchiver: {
        options: {
          baseUrl: 'app',
          mainConfigFile: "app/config.js",
          out: "dist/app/models/rar_unarchiver.js",
          name: 'models/rar_unarchiver',
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
