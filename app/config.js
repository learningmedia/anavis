System.config({
  "baseURL": "/",
  "transpiler": "babel",
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "dexie": "npm:dexie@1.1.0",
    "knockout": "npm:knockout@3.3.0",
    "learningmedia/intempojs": "github:learningmedia/intempojs@1.0.2",
    "text": "github:systemjs/plugin-text@0.0.2",
    "whatwg-fetch": "npm:whatwg-fetch@0.7.0",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:knockout@3.3.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

