import ko from 'knockout';

const vm = {
  settings: ko.observableArray([]),
  works: ko.observableArray([]),
  currentPart: ko.observable(),
  currentTool: ko.observable('default')
};

vm.currentWork = ko.computed(() => vm.currentPart() ? vm.works().find(work => work.parts().indexOf(vm.currentPart()) !== -1) : undefined);

export default vm;
