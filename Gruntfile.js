module.exports = function(grunt) {

  var colors = require('colors'),
      Handlebars = require('Handlebars'),
      _ = require('lodash'),
      pkg = grunt.file.readJSON('package.json'),
      basePath = '/';

  grunt.initConfig({
    pkg: pkg,
    timestamp: new Date().getTime(),

    meta: {

      dir: {
        assets: './assets',
        sass: './src/styles',
        scripts: './src/scripts',
      }
    }, // meta

    clean: {
      stamped: [ '{css,js}/bundled.*'] 
    },

    browserify: {
      // './js/bundled.<%=timestamp%>.js': ['<%=meta.dir.scripts%>/script.js'],
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

    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          loadPath: 'node_modules/'
        },
        files: {
          // './css/bundled.<%=timestamp%>.css': './src/styles/styles.scss'
          './css/bundled.css': './src/styles/styles.scss'
        }
      }
    }, // sass

    watch: {
      options: {
        spawn: false
      },
      markup: {
        files: [
          './src/**/*',
        ],
        tasks: ['generate', 'browserify', 'sass']
      },
      // scripts: {
      //   files: [
      //     './src/templates/*.hbs',
      //     './src/data/*.json',
      //     './src/scripts/lib/*.js',
      //     './src/scripts/*.js',
      //   ],
      //   tasks: ['browserify']
      // },
      // styles: {
      //   files: [
      //     '<%=meta.dir.sass%>/**/*.scss'
      //   ],
      //   tasks: ['sass']
      // },
    } // watch
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

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

  grunt.registerTask('generate', function(production) {
    Handlebars.registerHelper({
      hyphenize: function(str) {
        return _.kebabCase(str);
      }, // hyphenize
      lowercase: function(str) {
        return _.toLower(str);
      }, // lowercase
    });    

    var d = new Date(),
        data = {
          PRODUCTION: production ? true : false,
          PUBDATE: d.toISOString(),
          TIMESTAMP: d.getTime(),
          metadata: grunt.file.readJSON('./src/data/metadata.json'),
          projects: _.sortBy(_.filter(grunt.file.readJSON('./src/data/projects.json'), 'spotlight'), ['spotlight']),
        },
        template = Handlebars.compile(grunt.file.read('src/templates/index.hbs'));

    grunt.config.set('timestamp', d.getTime());

    data.metadata['og:pubdate'] = data.PUBDATE;

    grunt.file.expand([
      'src/templates/partials/*.hbs'
    ]).forEach(function(f) {
      var name = f.replace(/.*\/(.*)\.hbs$/, "$1");
      Handlebars.registerPartial(name, grunt.file.read(f));
    });

    grunt.file.write('index.html', template(data));

  });


  var defaultTasks = grunt.option('bump') ? ['bump:patch', 'collect', 'watch'] : ['collect', 'watch'];

  // Register Default task(s)
  // grunt.registerTask('collect', ['clean', 'sass', 'copy', 'merge-templates', 'browserify']);
  grunt.registerTask('collect', ['generate', 'sass', 'browserify']);
  grunt.registerTask('build', ['collect', 'version']);
  grunt.registerTask('default', defaultTasks);
  console.log('\n');

};