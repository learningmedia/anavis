const fs = require('fs');
const ko = require('knockout');
const path = require('path');
const file = require('../file');

const template = fs.readFileSync(`${__dirname}/help-screen.html`, 'utf8');

function viewModel() {
  const vm = { };
  return vm;
}

function register() {
  ko.components.register('av-help-screen', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
