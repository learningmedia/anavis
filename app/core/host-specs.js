(function () {
  'use strict';

  describe('Host', () => {

    let host;
    beforeEach(function () {
      module('anavis');
      host = getDependency('host');
    });

    it('should have an empty array of works', () => {
      expect(host.works).toEqual([]);
    });

    describe('when "executeCommand" is called with a "createWork" command', () => {

      let commandFactory;
      let createWorkCommand;
      beforeEach(function () {
        commandFactory = getDependency('commandFactory');
        createWorkCommand = commandFactory.createWork();
        host.executeCommand(createWorkCommand);
      });

      it('should create a new work with one part', () => {
        expect(host.works.length).toBe(1);
      });

    });

  });

})();
