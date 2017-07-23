const ko = require('knockout');
const tools = require('../shared/tools');

const vm = {
  settings: ko.observableArray([]),
  works: ko.observableArray([]),
  currentPart: ko.observable(),
  currentPrimaryTool: ko.observable(tools.DEFAULT),
  currentSecondaryTool: ko.observable(null),
  isInspectorExpanded: ko.observable(false)
};

vm.currentWork = ko.computed(() => vm.currentPart() ? vm.works().find(work => work.parts().indexOf(vm.currentPart()) !== -1) : undefined);
vm.currentTool = ko.computed(() => vm.currentSecondaryTool() || vm.currentPrimaryTool());
vm.isCurrentToolPrimary = ko.computed(() => vm.currentTool() === vm.currentPrimaryTool());

module.exports = vm;
