const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/flyout-menu-item.html`, 'utf8');

function viewModel(params) {
  const label = params.label;
  const onClick = params.onClick;
  return {
    label,
    onClick
  };
}

function register() {
  ko.components.register('av-flyout-menu-item', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
