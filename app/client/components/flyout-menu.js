const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/flyout-menu.html`, 'utf8');

function viewModel(params) {
  const vm = {};
  vm.isFlyoutVisible = ko.observable(false);
  vm.toggleFlyout = () => vm.isFlyoutVisible(!vm.isFlyoutVisible());
  return vm;
}

function register() {
  ko.components.register('av-flyout-menu', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
