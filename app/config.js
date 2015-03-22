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
    "knockout": "npm:knockout@3.3.0",
    "learningmedia/intempojs": "github:learningmedia/intempojs@1.0.2",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:knockout@3.3.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});
