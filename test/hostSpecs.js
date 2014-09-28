(function () {
  'use strict';

  describe('Host', () => {

    let host;
    beforeEach(() => {
      host = angular.injector(['anavis']).get('core.host');
    });

    it('should have an empty array of works', () => {
      expect(host.works).toEqual([]);
    });

  });

})();
