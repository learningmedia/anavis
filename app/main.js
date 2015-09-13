import ko from "knockout";
import utils from "utils";
import toolbar from "components/toolbar";
import workService from "work-service";

window.ko = ko;

// Register all components:
[toolbar].forEach(component => component.register());

const vm = { utils };

(function startApplication() {
  vm.works = workService.works;
  ko.applyBindings(vm);
})();
