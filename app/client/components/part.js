const fs = require('fs');
const ko = require('knockout');
const utils = require('../utils');

const template = fs.readFileSync(`${__dirname}/part.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  const work = params.work;
  const part = params.part;

  const vm = {};
  vm.id = part.id;
  vm.name = part.name;
  vm.color = part.color;
  vm.contrastColor = ko.pureComputed(() => utils.getContrastColor(part.color()));
  vm.isSelected = ko.pureComputed(() => app.currentPart() === part);
  vm.isInEditMode = ko.observable(false);
  vm.onDblClick = () => vm.isInEditMode(true);
  vm.onKeyDown = (viewModel, event) => {
    let offset;
    let vmOfNextDomElement;
    switch (event.key) {
      case 'Tab':
        offset = event.shiftKey ? -1 : 1;
        vmOfNextDomElement = getNeighbouringPartViewModel(work, part, offset);
        if (vmOfNextDomElement) {
          vmOfNextDomElement.isInEditMode(true);
          return false;
        } else {
          return true;
        }
      case 'Enter':
        vm.isInEditMode(false);
        return false;
      default:
        return true;
    }
  };
  vm.isInEditMode.subscribe(newValue => {
    if (!newValue) {
      vm.name(vm.name().trim());
      return;
    }
    const elem = window.document.querySelector(`[data-part-id='${vm.id()}'] [data-part-name-editor]`);
    if (elem) {
      elem.setSelectionRange(0, elem.value.length);
    }
  });
  return vm;
}

function getNeighbouringPartViewModel(work, currentPart, offset) {
  const index = work.parts().indexOf(currentPart);
  const neighbour = work.parts()[index + offset];
  if (!neighbour) return null;
  const neighbourDomElement = window.document.querySelector(`[data-part-id='${neighbour.id()}']`);
  return neighbourDomElement ? ko.dataFor(neighbourDomElement) : null;
}

function register() {
  ko.components.register('av-part', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
