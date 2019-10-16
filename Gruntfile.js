module.exports = function(grunt) {

  var colors = require('colors'),
      pkg = grunt.file.readJSON('package.json'),
      basePath = '/';

  grunt.initConfig({
    pkg: pkg,

    meta: {
      dir: {
        assets: './assets',
        sass: './src/styles',
        scripts: './src/scripts',
      }
    }, // meta

    // autoprefixer: {
    //   options: {
    //     browsers: 'last 6 versions'
    //   },
    //   dist:{
    //     files:{
    //       '<%=meta.dir.assets%>/styles/prototype.css':'<%=meta.dir.assets%>/styles/prototype.css'
    //     }
    //   }
    // }, // autoprefixer

    browserify: {
      './js/bundled.js': ['<%=meta.dir.scripts%>/script.js'],
      options: {
        transform: [
          [
            "hbsfy", {
              "extensions": [
                "hbs"
              ]
            }
          ]
        ]
      }
    }, // browserify

    // clean: {
    //   all: [ './assets'] 
    // }, // clean

    // copy: {
    //   assets: {
    //     files: [{
    //       expand: true,
    //       flatten: false,
    //       filter: 'isFile',
    //       cwd: 'src/',
    //       src: [
    //         '{styles,fonts,images,data}/**',
    //         'templates/*.hbs',
    //         '!**/*.scss'
    //       ],
    //       dest: './assets'
    //     }]
    //   },
    //   fonts: {
    //     files: [{
    //       expand: true,
    //       flatten: true,
    //       filter: 'isFile',
    //       cwd: 'node_modules/font-awesome/fonts/',
    //       src: [
    //         '*.*'
    //       ],
    //       dest: './assets/fonts'
    //     }]
    //   }
    // }, // copy

    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          loadPath: 'node_modules/'
        },
        files: {
          './css/bundled.css': './src/styles/styles.scss'
        }
      }
    }, // sass

    watch: {
      options: {
        spawn: false
      },
      // assets: {
      //   files: [
      //     './src/{fonts,images,templates}/*'
      //   ],
      //   tasks: ['copy']
      // },
      scripts: {
        files: [
          './src/templates/*.hbs',
          './src/data/*.json',
          './src/scripts/lib/*.js',
          './src/scripts/*.js',
        ],
        tasks: ['browserify']
      },
      styles: {
        files: [
          '<%=meta.dir.sass%>/**/*.scss'
        ],
        tasks: ['sass']
      },
    } // watch
  });

  // grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-browserify');
  // grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('bump', 'Bumps a project\'s version number up across relevant files.', function(version) {

    var currentVersion = grunt.config('pkg').version;

    switch(version) {
      case 'check':
        console.log('\nThe current version is ' + colors.cyan.bold(currentVersion) + '.');
        return;
      case 'patch':
        version = currentVersion.replace(/([0-9]+)$/, function(match, capture) {
          return +capture + 1;
        });
        break;
      case 'minor':
        version = currentVersion.replace(/(\d+)\.\d+$/, function(match, capture) {
          return (+capture + 1) + '.0';
        });
        break;
      case 'major':
        version = currentVersion.replace(/^(\d+)\.\d+\.\d+/, function(match, capture) {
          return (+capture + 1) + '.0.0';
        });
        break;
      default:
        break;
    }

    if(!/\d+\.\d+\.\d+/.test(version)) {
      grunt.fail.fatal('\n\nYou need to specify a valid version number!\n\nThe current version is: ' + colors.yellow.bold(currentVersion) + '\n');
    }

    console.log('\nOK! Moving the needle from ' + colors.cyan.bold(currentVersion) + ' to ' + colors.cyan.bold(version) + '.');

    grunt.file.expand([
      'package.json'
    ]).forEach(function(f) {
      var json = grunt.file.readJSON(f);
      json.version = version;
      grunt.file.write(f, JSON.stringify(json, null, 2));
    });
  }); // bump

  grunt.registerTask('version', function() {
    grunt.file.write('VERSION', pkg.version);
  });

  var defaultTasks = grunt.option('bump') ? ['bump:patch', 'collect', 'watch'] : ['collect', 'watch'];

  // Register Default task(s)
  // grunt.registerTask('collect', ['clean', 'sass', 'copy', 'merge-templates', 'browserify']);
  grunt.registerTask('collect', ['sass', 'browserify']);
  grunt.registerTask('build', ['collect', 'version']);
  grunt.registerTask('default', defaultTasks);
  console.log('\n');

};