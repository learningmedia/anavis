'use strict';

import host from 'core/host';
import commandFactory from 'core/command-factory';

describe('Host', () => {

  describe('when reset', () => {

    beforeEach(function () {
      host.reset();
    });

    it('should have an empty array of works', () => {
      expect(host.works).toEqual([]);
    });

  });

  describe('when "executeCommand" is called with a "createWork" command', () => {

    let createWorkCommand;
    beforeEach(function () {
      createWorkCommand = commandFactory.createWork();
      host.executeCommand(createWorkCommand);
    });

    it('should create a new work with one part', () => {
      expect(host.works.length).toBe(1);
    });

  });

});
