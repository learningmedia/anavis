/* eslint strict: 0 */
"use strict";

var fs                 = require("fs");
var url                = require("url");
var path               = require("path");
var gulp               = require("gulp");
var less               = require("less");
var jspm               = require("jspm");
var karma              = require("karma");
var rimraf             = require("rimraf");
var runSequence        = require("run-sequence");
var browserSync        = require("browser-sync").create();
var AutoPrefixPlugin   = require("less-plugin-autoprefix");
var historyApiFallback = require("connect-history-api-fallback")();
var $                  = require("gulp-load-plugins")();

var autoPrefix = new AutoPrefixPlugin({
  browsers: ["last 3 versions", "last 3 BlackBerry versions", "last 3 Android versions"]
});

gulp.task("clean", function (done) {
  rimraf.sync("dist", { maxBusyTries: 5 });
  done();
});

gulp.task("lint", function () {
  return gulp.src(["**/*.js", "!dist/**", "!node_modules/**", "!app/jspm_packages/**"])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(shouldExitOnFailure, $.eslint.failAfterError()));
});

gulp.task("build:css", function () {
  return gulp.src("app/main.less")
    .pipe($.less({ plugins: [autoPrefix] }))
    .pipe($.csso())
    .pipe(gulp.dest("dist"));
});

gulp.task("build:js", function (done) {
  jspm.setPackagePath(".");
  new jspm.Builder()
    .buildSFX("main", "dist/main.js", { minify: true, mangle: true, sourceMaps: true, lowResSourceMaps: false })
    .then(done.bind(null, null), done);
});

gulp.task("build:html", function () {
  return gulp.src("app/index.html")
    .pipe($.htmlReplace({ css: "/main.css", js: "/main.js" }))
    .pipe($.minifyHtml({ empty: true, spare: true, quotes: true }))
    .pipe(gulp.dest("dist"));
});

gulp.task("build", function (done) {
  runSequence("clean", "lint-and-test", ["build:css", "build:js", "build:html"], done);
});

gulp.task("test", function (done) {
  runKarma(done, true, ["Chrome"]);
});

gulp.task("test:debug", function (done) {
  runKarma(done, false, ["Chrome"]);
});

gulp.task("lint-and-test", function (done) {
  runSequence("lint", "test", done);
});

gulp.task("reload-styles", function () {
  browserSync.reload("main.less");
});

gulp.task("serve", function () {
  startBrowserSync("app");
  gulp.watch(["app/**/*.js"], ["lint-and-test"]);
  gulp.watch(["app/**/*.less"], ["reload-styles"]);
});

gulp.task("serve:dist", function () {
  startBrowserSync("dist");
});

gulp.task("default", ["serve"]);

function lessMiddleware (req, res, next) {
  var requestedPath = url.parse(req.url).pathname;
  if (requestedPath.match(/\.less$/)) {
    var fileName = path.resolve("app" + requestedPath);
    var content = fs.readFileSync(fileName).toString();
    return less.render(content, { filename: fileName, plugins: [autoPrefix] }).then(function (output) {
      res.setHeader("Content-Type", "text/css");
      res.end(output.css);
    });
  }
  next();
}

function runKarma(done, singleRun, browsers) {
  var server = new karma.Server({
    configFile: path.resolve("karma.conf.js"),
    singleRun: singleRun,
    browsers: browsers || ["Chrome"]
  }, function (failedTests) {
    if (failedTests && shouldExitOnFailure()) {
      throw new Error("Terminating process due to failing tests.");
    }
    done();
  });
  server.start();
}

function startBrowserSync(baseDir, browser) {
  browserSync.init({
    files: [baseDir + "/**"],
    server: { baseDir: baseDir, middleware: [lessMiddleware, historyApiFallback] },
    injectFileTypes: ["less"],
    startPath: "/",
    browser: browser || "default"
  });
}

function shouldExitOnFailure() {
  return !browserSync.active;
}
