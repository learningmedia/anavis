const fs = require('fs');
const path = require('path');
const ko = require('knockout');
const tools = require('../../shared/tools');

const template = fs.readFileSync(`${__dirname}/inspector.html`, 'utf8');

function viewModel(params) {
  const app = params.app;
  return {
    app: app,
    tools: tools,
    currentTool: app.currentTool,
    isCurrentToolPrimary: app.isCurrentToolPrimary,
    isExpanded: app.isInspectorExpanded,
    fileName: ko.pureComputed(() => {
      if (app.currentPart() && app.currentWork()._.zipFileName()) {
        return path.basename(app.currentWork()._.zipFileName());
      } else {
        return '';
      }
    }),
    selectTool: tool => app.currentPrimaryTool(tool),
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
