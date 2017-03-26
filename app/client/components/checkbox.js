const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/checkbox.html`, 'utf8');

function viewModel(params) {

  return {
    text: params.text,
    checked: params.checked,
    disabled: params.disabled
  };

}

function register() {
  // Register the checkbox as a new knockout component:
  ko.components.register('av-checkbox', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
