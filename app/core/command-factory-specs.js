(function () {
  'use strict';

  describe('In commandFactory', () => {

    let commandFactory;
    beforeEach(() => {
      module('anavis');
      commandFactory = getDependency('commandFactory');
    });

    describe('createWork', () => {

      let command;

      beforeEach(() => {
        command = commandFactory.createWork();
      });

      it('should create a new command and set the command name', () => {
        expect(command.name).toBe('createWork');
      });

    });

    describe('changePartLength', () => {

      const partId = 'some-fake-part-id';
      const newLength = 120;
      let command;

      beforeEach(() => {
        command = commandFactory.changePartLength(partId, newLength);
      });

      it('should create a new command and set the command name', () => {
        expect(command.name).toBe('changePartLength');
      });

      it('should create a new command and set the part ID', () => {
        expect(command.partId).toBe(partId);
      });

      it('should create a new command and set the new length', () => {
        expect(command.newLength).toBe(newLength);
      });

    });

    describe('changePartCategory', () => {

      const partId = 'some-fake-part-id';
      const newCategoryId = 'some-fake-category-id';
      let command;

      beforeEach(() => {
        command = commandFactory.changePartCategory(partId, newCategoryId);
      });

      it('should create a new command and set the command name', () => {
        expect(command.name).toBe('changePartCategory');
      });

      it('should create a new command and set the part ID', () => {
        expect(command.partId).toBe(partId);
      });

      it('should create a new command and set the new category ID', () => {
        expect(command.newCategoryId).toBe(newCategoryId);
      });

    });

  });

})();
