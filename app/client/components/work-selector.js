const fs = require('fs');
const ko = require('knockout');
const koMapping = require('knockout-mapping');
const appViewModel = require('../app-view-model');

const template = fs.readFileSync(`${__dirname}/work-selector.html`, 'utf8');

function viewModel(params) {
  const vm = {};

  vm.workInfos = koMapping.fromJS(params.workInfos.map(info => Object.assign({ isSelected: false }, info)));

  vm.onSaveClick = () => {
    const workIdsToSave = vm.workInfos().filter(info => info.isSelected()).map(info => info.id());
    params.callback(workIdsToSave);
  };

  vm.onCancelClick = () => {
    params.callback(false);
  };

  return vm;
}

function register() {
  // Register the work-selector as a new knockout component:
  ko.components.register('av-work-selector', {
    viewModel: viewModel,
    template: template
  });
}

let isShown = false;

function show(params) {
  if (isShown) return;

  const overlay = {
    component: {
      name: 'av-work-selector',
      params: {
        workInfos: params.workInfos,
        callback: val => {
          isShown = false;
          appViewModel.appOverlays.remove(overlay);
          return params.callback && params.callback(val);
        }
      }
    },
    align: 'center',
    justify: 'center'
  }

  appViewModel.appOverlays.push(overlay);

  isShown = true;
}

module.exports = { register, show };
