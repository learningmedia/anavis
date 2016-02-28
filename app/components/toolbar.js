import ko from 'knockout';
import template from './toolbar.html';

function viewModel(params) {
  const app = params.app;
  return {
    app: app,
    selectTool: tool => app.currentTool(tool)
  };
}

function register() {
  ko.components.register('av-toolbar', {
    viewModel: viewModel,
    template: template
  });
}

export default { register };
