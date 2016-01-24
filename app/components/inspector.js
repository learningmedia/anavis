import ko from 'knockout';
import template from './inspector.html';

function viewModel(params) {
  const app = params.app;
  return {
    currentWork: app.currentWork,
    currentPart: app.currentPart,
    currentSound: app.currentSound
  };
}

function register() {
  ko.components.register('av-inspector', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
