const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/inspector.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  return {
    app: app,
    selectTool: tool => app.currentTool(tool),
    toggleCollapse: () => app.isInspectorExpanded(!app.isInspectorExpanded()),
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

module.exports = { register };
