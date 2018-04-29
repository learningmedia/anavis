const fs = require('fs');
const ko = require('knockout');
const koMapping = require('knockout-mapping');

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

function show(params) {
  const outerDiv = document.createElement('div');
  const innerDiv = document.createElement('div');
  outerDiv.setAttribute('data-bind', 'if: component');
  innerDiv.setAttribute('data-bind', 'component: component');
  outerDiv.appendChild(innerDiv);
  document.body.insertBefore(outerDiv, document.body.firstChild);

  const vm = {
    component: ko.observable({
      name: 'av-work-selector',
      params: {
        workInfos: params.workInfos,
        callback: val => {
          vm.component(null); // Let knockout do the disposal
          document.body.removeChild(outerDiv);
          return params.callback && params.callback(val); // Do the real callback!
        }
      }
    })
  };

  ko.applyBindings(vm, outerDiv);
}

module.exports = { register, show };
