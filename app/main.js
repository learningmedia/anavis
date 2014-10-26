(function (window, chroma) {
  'use strict';

  function findContrast(color) {
    return chroma.hex(color).luminance() < 0.33 ? '#EEE' : '#111';
  }

  let anavisApp = angular.module('app', ['core']);

  anavisApp.controller('testCtrl', ['$scope', 'core.elementFactory', function ($scope, elementFactory) {

    function workToJson(work) {
      let obj = {
        categories: work.categories,
        parts: work.parts.map(x => ({ id: x.id, categoryId: x.category.id, length: x.length }))
      };
      return angular.toJson(obj);
    }

    function jsonToWork(json) {
      let obj = angular.fromJson(json);
      let categories = obj.categories.map(x => elementFactory.createCategory(x.name, x.color, x.id));
      let parts = obj.parts.map(x => elementFactory.createPart(categories.find(y => y.id === x.categoryId), x.length, x.id));

      return {
        categories: categories,
        parts: parts
      };
    }

    function part(category, length) {
      return elementFactory.createPart(category, length);
    }

    function category(name, color) {
      return elementFactory.createCategory(name, color);
    }

    function createDefaultWork() {
      let categories = [
        category('Intro', '#4582B4'),
        category('Verse', '#FFD700'),
        category('Chorus', '#228B22'),
        category('Bridge', '#FF0000'),
        category('Outro', '#4582B4')
      ];
      return {
        categories: categories,
        parts: [
          part(categories[0], 100),
          part(categories[1], 200),
          part(categories[2], 300),
          part(categories[1], 200),
          part(categories[2], 300),
          part(categories[3], 150),
          part(categories[2], 300),
          part(categories[2], 300),
          part(categories[4], 100)
        ]
      };
    }

    let json = localStorage.getItem('work');
    let work = json ? jsonToWork(json) : createDefaultWork();

    $scope.categories = work.categories;

    $scope.parts = work.parts;

    $scope.removeCategory = category => {
      if (work.parts.find(x => x.category === category)) {
        window.alert('This category cannot be removed because it is in use.');
        return;
      }
      let index = work.categories.indexOf(category);
      work.categories.splice(index, 1);
    };

    $scope.removePart = part => {
      if (work.parts.length < 2) {
        window.alert('This part cannot be removed because it is the only one.');
        return;
      }
      let index = work.parts.indexOf(part);
      work.parts.splice(index, 1);
    };

    $scope.addPart = () => work.parts.push(part(work.categories[0], 100));

    $scope.calculateForeground = color => findContrast(color);

    $scope.save = () => {
      let w = {
        parts: work.parts,
        categories: work.categories
      };
      window.localStorage.setItem('work', workToJson(w));
    };

  }]);

})(window, window.chroma);
