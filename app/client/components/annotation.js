const fs = require('fs');
const ko = require('knockout');

const template = fs.readFileSync(`${__dirname}/annotation.html`, 'utf8');

function viewModel(params) {
  const subscriptions = [];

  const valuesPerPart = params.parts()
    .map((part, index) => {
      return {
        part: part,
        text: createTextObservable(ko.unwrap(params.annotation.values()[index]))
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
        text = createTextObservable('');
        valuesPerPart[part.id()] = text;
      }

      return {
        text,
        length: part.length()
      };
    })
  });

  function createTextObservable(initialValue) {
    const text = ko.observable(initialValue);
    subscriptions.push(text.subscribe(copyValuesFromTuplesToAnnotation));
    return text;
  }

  function copyValuesFromTuplesToAnnotation() {
    params.annotation.values(params.parts().map(part => valuesPerPart[part.id()]()));
  }

  return {
    tuples: tuples,
    onBlur: (vm, event) => event.target.scrollTop = 0,
    onDeleteClick: () => console.log('Gelöscht'),
    dispose: () => subscriptions.forEach(sub => sub.dispose())
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
