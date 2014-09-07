define([], function () {
  'use strict';

  describe('In commandFactory', function () {
    var commandFactory;
    var async = new AsyncSpec(this);

    async.beforeEach(function (done) {
      require(['core/commandFactory'], function (_commandFactory) {
        commandFactory = _commandFactory;
        done();
      });
    });

    describe('changePartLength', function () {
      var partId = 'some-fake-part-id';
      var newLength = 120;
      var command;

      beforeEach(function () {
        command = commandFactory.changePartLength(partId, newLength);
      });

      it('should create a new command and set the command name', function () {
        expect(command.name).toBe('changePartLength');
      });

      it('should create a new command and set the part ID', function () {
        expect(command.partId).toBe(partId);
      });

      it('should create a new command and set the new length', function () {
        expect(command.newLength).toBe(newLength);
      });

    });

    describe('changePartCategory', function () {
      var partId = 'some-fake-part-id';
      var newCategoryId = 'some-fake-category-id';
      var command;

      beforeEach(function () {
        command = commandFactory.changePartCategory(partId, newCategoryId);
      });

      it('should create a new command and set the command name', function () {
        expect(command.name).toBe('changePartCategory');
      });

      it('should create a new command and set the part ID', function () {
        expect(command.partId).toBe(partId);
      });

      it('should create a new command and set the new category ID', function () {
        expect(command.newCategoryId).toBe(newCategoryId);
      });

    });

  });

});
