"use strict";

module.exports = function (config) {

  config.set({
    basePath: "",
    frameworks: ["jspm", "jasmine", "phantomjs-shim"],
    files: [],
    jspm: {
      serveFiles: ["app/**"],
      loadFiles: ["app/**/*.specs.js"]
    },
    proxies: {
      "/base/": "/base/app/"
    },
    exclude: [],
    preprocessors: {},
    reporters: ["spec"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false
  });

};
