(function (window, chroma) {
  'use strict';

  var findContrast = function (color) {
    return chroma.hex(color).luminance() < 0.33 ? '#EEE' : '#111';
  };

  var anavisApp = angular.module('app', ['core']);

  anavisApp.controller('testCtrl', ['$scope', 'core.elementFactory', function ($scope, elementFactory) {

    var workToJson = function (work) {
      var obj = {
        categories: work.categories,
        parts: work.parts.map(x => { return { id: x.id, categoryId: x.category.id, length: x.length }; })
      };
      return angular.toJson(obj);
    };

    var jsonToWork = function (json) {
      let obj = angular.fromJson(json);
      let categories = obj.categories.map(x => elementFactory.createCategory(x.name, x.color, x.id));
      let parts = obj.parts.map(x => elementFactory.createPart(categories.find(y => y.id === x.categoryId), x.length, x.id));

      return {
        categories: categories,
        parts: parts
      };
    };

    var part = function (category, length) {
      return elementFactory.createPart(category, length);
    };

    var category = function (name, color) {
      return elementFactory.createCategory(name, color);
    };

    let createDefaultWork = function () {
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
        categories: categories,
        parts: parts
      };
    };

    let work;
    let json = localStorage.getItem('work');
    if (json) {
      work = jsonToWork(json);
    } else {
      work = createDefaultWork();
    }

    $scope.categories = work.categories;
    $scope.parts = work.parts;
    $scope.removeCategory = function (category) {
      if (work.parts.find(x => x.category === category)) {
        window.alert('This category cannot be removed because it is in use.');
        return;
      }
      var index = work.categories.indexOf(category);
      work.categories.splice(index, 1);
    };
    $scope.removePart = function (part) {
      if (work.parts.length < 2) {
        window.alert('This part cannot be removed because it is the only one.');
        return;
      }
      var index = work.parts.indexOf(part);
      work.parts.splice(index, 1);
    };
    $scope.addPart = () => work.parts.push(part(work.categories[0], 100));
    $scope.calculateForeground = color => findContrast(color);
    $scope.save = function () {
      let w = {
        parts: work.parts,
        categories: work.categories
      };
      let json = workToJson(w);
      window.localStorage.setItem('work', json);
    };
  }]);

}) (window, window.chroma);
