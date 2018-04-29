const ko = require('knockout');
const tools = require('../shared/tools');
const soundControllerStates = require('./sound-controller-states');

const vm = {
  settings: ko.observableArray([]),
  works: ko.observableArray([]),
  currentPart: ko.observable(),
  currentPrimaryTool: ko.observable(tools.DEFAULT),
  currentSecondaryTool: ko.observable(null),
  isInspectorExpanded: ko.observable(false),
  appOverlays: ko.observableArray()
};

vm.currentWork = ko.computed(() => vm.currentPart() ? vm.works().find(work => work.parts().indexOf(vm.currentPart()) !== -1) : undefined);
vm.firstPlayingSoundInfo = ko.computed(() => {
  for (let work of vm.works()) {
    for (let sound of work.sounds()) {
      if (sound._.controller().state() === soundControllerStates.PLAYING) return { work, sound };
    }
  }

  return undefined;
});
vm.currentTool = ko.computed(() => vm.currentSecondaryTool() || vm.currentPrimaryTool());
vm.isCurrentToolPrimary = ko.computed(() => vm.currentTool() === vm.currentPrimaryTool());
vm.isSplashScreenVisible = ko.computed(() => vm.works().length === 0);

vm.deselectAll = () => vm.currentPart(undefined);

module.exports = vm;
