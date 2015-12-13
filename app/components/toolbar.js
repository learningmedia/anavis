import ko from 'knockout';
import workService from '../work-service';
import template from './toolbar.html';

function createToolbarViewModel() {
  return {
    stop: () => workService.works().forEach(w => w.sound && w.sound.stop()),
    pause: () => workService.works().forEach(w => w.sound && w.sound.pause()),
    create: () => workService.create()
  };
}

function register() {
	// Register the toolbar as a new knockout component:
	ko.components.register('av-toolbar', {
    viewModel: createToolbarViewModel,
    template: template
	});
}

export default { register };
