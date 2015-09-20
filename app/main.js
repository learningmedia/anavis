import ko from "knockout";
import utils from "utils";
import soundDrop from "bindings/sound-drop";
import toolbar from "components/toolbar";
import soundPlayer from "components/sound-player";
import workService from "work-service";

window.ko = ko;

// Register all bindings:
[soundDrop].forEach(binding => binding.register());

// Register all components:
[toolbar, soundPlayer].forEach(component => component.register());

const vm = { utils };

(function startApplication() {
  vm.works = workService.works;
  ko.applyBindings(vm);
})();
