(function (window, ko, chroma) {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {

    var findContrast = function (color) {
      return chroma.hex(color).luminance() < 0.33 ? '#EEE' : '#111';
    };

    var category = function (name, color) {
      var vm = {
        name: ko.observable(name),
        color: ko.observable(color)
      };
      vm.foreground = ko.computed(function () {
        return findContrast(vm.color());
      });
      return vm;
    };

    var part = function (category, length) {
      return {
        category: ko.observable(category),
        length: ko.observable(length)
      };
    };

    var work = function (categories, parts) {
      var vm = {
        categories: ko.observableArray(categories),
        parts: ko.observableArray(parts)
      };
      vm.addPart = function () {
        vm.parts.push(part(vm.categories()[0], 100));
      };
      vm.removeCategory = function (category) {
        if (vm.parts().some(function (x) { return x.category() === category; })) {
          window.alert('This category cannot be removed because it is in use.');
          return;
        }
        vm.categories.remove(category);
      };
      vm.removePart = function (part) {
        if (vm.parts().length < 2) {
          window.alert('This part cannot be removed because it is the only one.');
          return;
        }
        vm.parts.remove(part);
      };
      return vm;
    };

    var viewModel = function () {
      var categories = [
        category('Intro', '#4582B4'),
        category('Verse', '#FFD700'),
        category('Chorus', '#228B22'),
        category('Bridge', '#FF0000'),
        category('Outro', '#4582B4')
      ];
      var parts = [
        part(categories[0], 100),
        part(categories[1], 200),
        part(categories[2], 300),
        part(categories[1], 200),
        part(categories[2], 300),
        part(categories[3], 150),
        part(categories[2], 300),
        part(categories[2], 300),
        part(categories[4], 100)
      ];
      return {
        work: work(categories, parts)
      };
    };

    ko.applyBindings(viewModel());

  }, false);

}) (window, window.ko, window.chroma);
