(function () {
  'use strict';

  describe('In elementFactory', function() {

    var elementFactory;

    beforeEach(function() {
      elementFactory = angular.injector(['core']).get('core.elementFactory');
    });

    describe('createPart', function () {

      var part;
      var category;
      beforeEach(function() {
        category = { testobject: 1 };
        part = elementFactory.createPart(category, 250);
      });

      it('should create a new part and set its ID', function() {
        expect(part.id).toBeDefined();
      });

      it('should use the provided ID if defined', function() {
        part = elementFactory.createPart(category, 250, 'some-id');
        expect(part.id).toBe('some-id');
      });

      it('should create a new part and set the category', function() {
        expect(part.category).toBe(category);
      });

      it('should create a new part and set the length', function() {
        expect(part.length).toBe(250);
      });
    });

    describe('createCategory', function () {

      var category;
      beforeEach(function () {
        category = elementFactory.createCategory("Bridge", "Red");
      });

      it('should create a new categroy and set its ID', function() {
        expect(category.id).toBeDefined();
      });

      it('should use the provided ID if defined', function() {
        category = elementFactory.createCategory("Bridge", "Red", 'some-id');
        expect(category.id).toBe('some-id');
      });

      it('should create a new categroy and set its color', function () {
        expect(category.color).toBe("Red");
      });

      it('should create a new categroy and set its name', function () {
        expect(category.name).toBe("Bridge");
      });
    });

    describe('createWork', function () {

      var work;
      beforeEach(function () {
        work = elementFactory.createWork();
      });

      it('should create a new work and set its ID', function() {
        expect(work.id).toBeDefined();
      });

      it('should create a new work and set its parts to an empty array', function() {
        expect(work.parts).toEqual([]);
      });

      it('should create a new work and set its categories to an empty array', function() {
        expect(work.categories).toEqual([]);
      });
    });

  });

})();
