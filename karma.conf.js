/* eslint strict: 0 */
"use strict";

module.exports = function (config) {

  config.set({
    basePath: "app",
    frameworks: ["jspm", "jasmine"],
    files: [],
    jspm: {
      serveFiles: ["**"],
      loadFiles: ["**/*.specs.js"]
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
