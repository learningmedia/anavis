import ko from 'knockout';
import template from './inspector.html';

function viewModel(params) {
  const app = params.app;
  return {
    workCount: ko.computed(() => app.works().length),
    currentWork: app.currentWork,
    currentPart: app.currentPart
  };
}

function register() {
  ko.components.register('av-inspector', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
