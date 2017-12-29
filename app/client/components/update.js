const fs = require('fs');
const ko = require('knockout');
//const { remote } = require('electron');

const template = fs.readFileSync(`${__dirname}/update.html`, 'utf8');

function getLatestVersion() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('v0.6'), 3000);

  });
}


function viewModel(params) {
  const vm = {};
  vm.version = ko.observable("");
  getLatestVersion().then((version) => {
    vm.version(version);
  });
  vm.onUpdateClick = function () {
    console.log("start update");
  };
  vm.onCancelClick = function () {
    vm.version("");
  };
  return vm;
}

function register() {
  // Register the update component as a new knockout component:
  ko.components.register('av-update', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
