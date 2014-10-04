(function () {
  'use strict';

  describe('In elementFactory', () => {

    let elementFactory;
    beforeEach(() => {
      module('anavis');
      elementFactory = getDependency('core.elementFactory');
    });

    describe('createPart', () => {

      let part;
      let category;
      beforeEach(() => {
        category = { testobject: 1 };
        part = elementFactory.createPart(category, 250);
      });

      it('should create a new part and set its ID', () => {
        expect(part.id).toBeDefined();
      });

      it('should use the provided ID if defined', () => {
        part = elementFactory.createPart(category, 250, 'some-id');
        expect(part.id).toBe('some-id');
      });

      it('should create a new part and set the category', () => {
        expect(part.category).toBe(category);
      });

      it('should create a new part and set the length', () => {
        expect(part.length).toBe(250);
      });

    });

    describe('createCategory', () => {

      let category;
      beforeEach(() => {
        category = elementFactory.createCategory('Bridge', 'Red');
      });

      it('should create a new categroy and set its ID', () => {
        expect(category.id).toBeDefined();
      });

      it('should use the provided ID if defined', () => {
        category = elementFactory.createCategory('Bridge', 'Red', 'some-id');
        expect(category.id).toBe('some-id');
      });

      it('should create a new categroy and set its color', () => {
        expect(category.color).toBe('Red');
      });

      it('should create a new categroy and set its name', () => {
        expect(category.name).toBe('Bridge');
      });

    });

    describe('createWork', () => {

      let work;
      beforeEach(() => {
        work = elementFactory.createWork();
      });

      it('should create a new work and set its ID', () => {
        expect(work.id).toBeDefined();
      });

      it('should create a new work and set its parts to an empty array', () => {
        expect(work.parts).toEqual([]);
      });

      it('should create a new work and set its categories to an empty array', () => {
        expect(work.categories).toEqual([]);
      });

      it('should create a new work and set its visualizations to an empty array', () => {
        expect(work.visualizations).toEqual([]);
      });

    });

  });

})();
