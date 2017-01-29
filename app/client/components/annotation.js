const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/annotation.html`, 'utf8');

function viewModel(params) {

  const tuples = [];
    for (let i = 0; i < params.parts().length; i++) {
      tuples[i] = {
        text: params.annotation.values()[i],
        part: params.parts()[i]
      };
    }

  return {
    tuples: tuples
  };

}

function register() {
  // Register the annotation as a new knockout component:
  ko.components.register('av-annotation', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
