import ko from "knockout";
import workList from "work-list";
import template from "components/toolbar.html!text";

function createToolbarViewModel() {
  return {
    stop: () => workList().forEach(w => w.sound && w.sound.stop()),
    pause: () => workList().forEach(w => w.sound && w.sound.pause())
  };
}

function register() {
	// Register the toolbar as a new knockout component:
	ko.components.register("av-toolbar", {
    viewModel: createToolbarViewModel,
    template: template
	});
}

export default { register };
