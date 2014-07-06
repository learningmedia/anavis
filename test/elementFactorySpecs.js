describe([], function () {

  var elementFactory;
  var async = new AsyncSpec(this);
  
  async.beforeEach(function (done) {
    require(['core/elementFactory'], function (_elementFactory) {
      elementFactory = _elementFactory;
      done();
    });
  });

  describe('createPart', function () {
    it('should create a new part and set its ID', function () {
      var part = elementFactory.createPart('testId', 250);
      expect(part.id).toBeDefined();
    });
  });

});
