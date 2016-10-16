import ko from 'knockout';

const vm = {
  settings: ko.observableArray([]),
  works: ko.observableArray([]),
  currentPart: ko.observable(),
  currentTool: ko.observable('default'),
  isInspectorExpanded: ko.observable(false)
};

vm.currentWork = ko.computed(() => vm.currentPart() ? vm.works().find(work => work.parts().indexOf(vm.currentPart()) !== -1) : undefined);

export default vm;
