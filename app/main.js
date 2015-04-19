import ko from "knockout";
import toolbar from "components/toolbar";
import workList from "work-list";

window.ko = ko;

// Register all components:
[toolbar].forEach(component => component.register());

const vm = {};
vm.works = workList;

ko.applyBindings(vm);
