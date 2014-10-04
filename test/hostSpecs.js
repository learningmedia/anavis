(function () {
  'use strict';

  function getDependency(name) {
    let dependency;
    let fun = ($injector) => {
      dependency = $injector.get(name);
    };
    fun.$inject = ['$injector'];
    inject(fun);
    return dependency;
  }

  describe('Host', () => {

    let host;
    beforeEach(function () {
      module('anavis');
      host = getDependency('core.host');
    });

    it('should have an empty array of works', () => {
      expect(host.works).toEqual([]);
    });

    describe('when "executeCommand" is called with a "createWork" command', () => {

      let commandFactory;
      let createWorkCommand;
      beforeEach(function () {
        commandFactory = getDependency('core.commandFactory');
        createWorkCommand = commandFactory.createWork();
        host.executeCommand(createWorkCommand);
      });

      it('should create a new work with one part', () => {
        expect(host.works.length).toBe(1);
      });

    });

  });

})();
