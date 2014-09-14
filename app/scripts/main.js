(function (window, chroma) {
  'use strict';

  var findContrast = function (color) {
    return chroma.hex(color).luminance() < 0.33 ? '#EEE' : '#111';
  };

  var category = function (name, color) {
    var vm = {
      name: name,
      color: color
    };
    vm.foreground = function () {
      return findContrast(vm.color);
    };
    return vm;
  };

  var part = function (category, length) {
    return {
      category: category,
      length: length
    };
  };

  var anavisApp = angular.module('anavisApp', []);

  anavisApp.controller('testCtrl', function ($scope) {
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
    $scope.categories = categories;
    $scope.parts = parts;
    $scope.removeCategory = function (category) {
      if (parts.some(function (x) { return x.category === category; })) {
        window.alert('This category cannot be removed because it is in use.');
        return;
      }
      var index = categories.indexOf(category);
      categories.splice(index, 1);
    };
    $scope.removePart = function (part) {
      if (parts.length < 2) {
        window.alert('This part cannot be removed because it is the only one.');
        return;
      }
      var index = parts.indexOf(part);
      parts.splice(index, 1);
    };
    $scope.addPart = function(){
      parts.push(part(categories[0], 100));
    };
  });

}) (window, window.chroma);
