const fs = require('fs');
const ko = require('knockout');
const path = require('path');
const file = require('../file');
const pkg = require('../../../package.json');
const config = require('../../shared/config');

const template = fs.readFileSync(`${__dirname}/splash-screen.html`, 'utf8');

function viewModel() {
  const vm = {
    anaVis: `${pkg.productName} ${pkg.version}`,
    recentUsedFiles: ko.observableArray(config.getValue('recentUsedFiles').slice().reverse()),
    onOpen: () => {
      file.open();
    },
    onCreate: () => {
      file.create();
    },
    onOpenRecentFile: (recentFile) => {
      file.openSingle(recentFile);
    },
    getFilename: (file) => {
      return path.basename(file);
    }
  };

  return vm;
}

function register() {
  ko.components.register('av-splash-screen', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
