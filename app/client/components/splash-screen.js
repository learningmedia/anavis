const fs = require('fs');
const ko = require('knockout');
const path = require('path');
const file = require('../file');
const pkg = require('../../../package.json');
const config = require('../../shared/config');

const template = fs.readFileSync(`${__dirname}/splash-screen.html`, 'utf8');

function viewModel(params) {
  const vm = {
    anaVis: `${pkg.productName} ${pkg.version}`,
    recentUsedFiles: ko.observableArray(config.getValue('recentUsedFiles').slice().reverse()),
    onClose: () => {
      params.app.isSplashScreenVisible(false);
    },
    onOpen: () => {
      file.open();
      params.app.isSplashScreenVisible(false);
    },
    onCreate: () => {
      file.create();
      params.app.isSplashScreenVisible(false);
    },
    onOpenRecentFile: (recentFile) => {
      file.openSingle(recentFile);
      params.app.isSplashScreenVisible(false);
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
