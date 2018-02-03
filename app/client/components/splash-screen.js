const fs = require('fs');
const ko = require('knockout');
const file = require('../file');
const pkg = require('../../../package.json');

const template = fs.readFileSync(`${__dirname}/splash-screen.html`, 'utf8');

function viewModel() {

  const vm = {
    anaVis: `${pkg.productName} ${pkg.version}`,
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
