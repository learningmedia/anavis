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
    isHidden: ko.observable(false),
    onClose: () => {
      vm.isHidden(true);
    },
    onOpen: () => {
      file.open();
      vm.isHidden(true);
    },
    onCreate: () => {
      file.create();
      vm.isHidden(true);
    },
    onOpenRecentFile: (recentFile) => {
      file.openSingle(recentFile);
      vm.isHidden(true);
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
