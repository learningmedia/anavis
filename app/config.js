System.config({
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  map: {
    "babel": "npm:babel-core@5.8.22",
    "babel-runtime": "npm:babel-runtime@5.8.20",
    "color": "npm:color@0.10.1",
    "core-js": "npm:core-js@1.1.1",
    "dexie": "npm:dexie@1.1.0",
    "drag-and-drop-files": "npm:drag-and-drop-files@0.0.1",
    "knockout": "npm:knockout@3.3.0",
    "learningmedia/intempojs": "github:learningmedia/intempojs@1.0.3",
    "text": "github:systemjs/plugin-text@0.0.2",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:babel-runtime@5.8.20": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:color-name@1.0.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:color-string@0.3.0": {
      "color-name": "npm:color-name@1.0.0"
    },
    "npm:color@0.10.1": {
      "color-convert": "npm:color-convert@0.5.3",
      "color-string": "npm:color-string@0.3.0"
    },
    "npm:core-js@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:knockout@3.3.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});
