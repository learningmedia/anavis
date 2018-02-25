const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/annotation.html`, 'utf8');

function viewModel(params) {
  const valuesPerPart = params.parts()
    .map((part, index) => {
      return {
        part: part,
        text: ko.observable(ko.unwrap(params.annotation.values()[index]))
      };
    })
    .reduce((table, item) => {
      table[item.part.id()] = item.text;
      return table;
    }, {});

  const tuples = ko.pureComputed(() => {
    return params.parts().map(part => {
      let text = valuesPerPart[part.id()];
      if (!text) {
        text = ko.observable('');
        valuesPerPart[part.id()] = text;
      }

      return {
        text,
        length: part.length()
      };
    })
  });

  return {
    tuples: tuples,
    onBlur: (vm, event) => event.target.scrollTop = 0
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
