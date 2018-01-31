const fs = require('fs');
const ko = require('knockout');
const semver = require('semver');
const { shell } = require('electron');
const superagent = require('superagent');
const pkg = require('../../../package.json');

const template = fs.readFileSync(`${__dirname}/update-notification.html`, 'utf8');

const githubReleasePage = 'https://api.github.com/repos/learningmedia/anavis/releases';

function byVersionDesc(a, b) {
  return semver.gt(a.tag_name, b.tag_name) ? -1 : 1;
}

function getLatestRelease() {
  return superagent.get(githubReleasePage)
    .then(res => {
      const latest = res.body.sort(byVersionDesc)[0];
      return {
        version: semver.valid(latest.tag_name),
        url: latest.html_url
      };
    })
    .catch(() => {
      return null;
    });
}

function viewModel() {
  const vm = {};

  vm.currentVersion = pkg.version;
  vm.latestRelease = ko.observable(null);
  vm.updateAvailable = ko.computed(() => vm.latestRelease() && semver.gt(vm.latestRelease().version, vm.currentVersion));

  vm.onUpdateClick = function () {
    shell.openExternal(vm.latestRelease().url);
    vm.latestRelease(null);
  };

  vm.onCancelClick = function () {
    vm.latestRelease(null);
  };

  getLatestRelease().then(r => vm.latestRelease(r));

  return vm;
}

function register() {
  ko.components.register('av-update-notification', {
    viewModel: viewModel,
    template: template
  });
}

module.exports = { register };
