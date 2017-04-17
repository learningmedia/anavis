const fs = require('fs');
const ko = require('knockout');
const utils = require('../utils');

const template = fs.readFileSync(`${__dirname}/part.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  const part = params.part;
  const vm = {};
  vm.name = part.name;
  vm.color = part.color;
  vm.backgroundColor = ko.pureComputed(() => utils.getContrastColor(part.color()));
  vm.isSelected = ko.pureComputed(() => app.currentPart() === part);
  vm.isInEditMode = ko.observable(false);
  vm.onDblClick = () => vm.isInEditMode(true);
  return vm;
}

function register() {
  ko.components.register('av-part', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
