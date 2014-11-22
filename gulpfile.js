'use strict';

var gulp               = require('gulp');
var path               = require('path');
var karma              = require('karma');
var rimraf             = require('rimraf');
var wiredep            = require('wiredep');
var runSequence        = require('run-sequence');
var browserSync        = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback');
var $                  = require('gulp-load-plugins')();
var exitOnFailure      = true;

gulp.task('clean', function (done) {
  ['.tmp', 'dist'].forEach(cleanDirectory);
  done();
});

gulp.task('scripts', function () {
  return gulp.src(['gulpfile.js', 'karma.conf.js', 'app/**/*.js', '!app/bower_components/**'])
    .pipe($.plumber({ errorHandler: exitOnFailure ? undefined : false }))
    .pipe($.jscs())
    .pipe($.plumber.stop())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(exitOnFailure, $.jshint.reporter('fail')));
});

gulp.task('styles', function () {
  return gulp.src(['app/styles/main.less'])
    .pipe($.less())
    .pipe($.autoprefixer('last 2 versions'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('dist:scripts', ['scripts'], function () {
  var distOnlyFilePattern = /^(.+)\.dist$/;
  return gulp.src(['app/**/*.js', '!app/**/*{dev,test,specs}.js', '!app/bower_components/**/*.js'])
    .pipe($.rename(function (file) { file.basename = file.basename.replace(distOnlyFilePattern, '$1'); }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:styles', ['styles'], function () {
  return gulp.src('.tmp/**/*.css')
    .pipe($.csso())
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:lib', function () {
  var bowerDeps = wiredep({
    directory: 'app/bower_components',
    dependencies: true,
    devDependencies: false
  });
  return gulp.src(bowerDeps.js)
    .pipe($.uglify())
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('dist:templates', function () {
  return gulp.src(['app/**/*.tpl.html', '!app/bower_components/**/*.tpl.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['dist:styles', 'dist:scripts', 'dist:lib', 'dist:templates'], function () {
  var files = ['dist/lib/traceur.js', 'dist/lib/es6-module-loader-sans-promises.js', 'dist/lib/system.js', 'dist/bootstrapper.js'];
  return gulp.src(['app/index.html'])
    .pipe($.inject(gulp.src(files), { read: false, starttag: '<!-- inject:scripts -->', ignorePath: 'dist/', addRootSlash: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', function (done) {
  runSequence('clean', 'test', 'dist', done);
});

gulp.task('test', function (done) {
  runKarma(done, true);
});

gulp.task('test:debug', function (done) {
  runKarma(done, false);
});

gulp.task('bower', function () {
  return $.bower();
});

gulp.task('watch', ['styles'], function () {
  gulp.watch(['app/*.less', 'app/!(bower_components)/**/*.less'], ['styles']);
  gulp.watch(['app/*.js', 'app/!(bower_components)/**/*.js'], ['scripts', 'test']);
});

gulp.task('serve', ['watch'], function () {
  exitOnFailure = false;
  startBrowserSync(
    ['app', '.tmp'],
    ['.tmp/**/*.css', 'app/*.html', 'app/!(bower_components)/**/*.tpl.html', 'app/*.js', 'app/!(bower_components)/**/*.js']);
});

gulp.task('serve:dist', function () {
  startBrowserSync('dist');
});

gulp.task('default', function (done) {
  runSequence('clean', 'serve', done);
});

function cleanDirectory(directory) {
  rimraf.sync(directory, { maxBusyTries: 5 });
}

function runKarma(done, singleRun) {
  karma.server.start({
    configFile: path.resolve('karma.conf.js'),
    singleRun: singleRun
  }, function (failedTests) {
    if (failedTests > 0 && exitOnFailure) {
      console.error('Terminating process due to failing tests.');
      process.exit(-1);
    } else {
      done();
    }
  });
}

function startBrowserSync(baseDir, files, browser) {
  browserSync.instance = browserSync.init(files, {
    server: { baseDir: baseDir, middleware: [historyApiFallback] },
    startPath: '/index.html',
    browser: browser || 'default'
  });
}
