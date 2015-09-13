import ko from "knockout";
import utils from "utils";
import soundDrop from "bindings/sound-drop";
import toolbar from "components/toolbar";
import workService from "work-service";

window.ko = ko;

// Register all bindings:
[soundDrop].forEach(binding => binding.register());

// Register all components:
[toolbar].forEach(component => component.register());

const vm = { utils };

(function startApplication() {
  vm.works = workService.works;
  ko.applyBindings(vm);
})();
