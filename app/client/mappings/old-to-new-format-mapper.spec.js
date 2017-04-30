const expect = require('expect.js');

const mapper = require('./old-to-new-format-mapper');
const input = require('./old-to-new-format-mapper.input.json');
// const expectedOutput = require('./old-to-new-format-mapper.expected-output.json');

describe('old-to-new-format-mapper', function () {

  describe('when mapDocument is called', function () {
    let error;
    let outputPackageDir;

    beforeEach(function (done) {
      const options = {
        id: 'e8df0341-02fc-4f53-a899-f6ce05dc92d2',
        name: 'Werk, das aus dem ZIP-File kam'
      };
      const inputPackageDir = '/home/user/.anavis/78436';
      const avdFileName = '/home/user/Desktop/test.avd';
      mapper.mapDocument(input, inputPackageDir, avdFileName, options, function (err, opd) {
        error = err;
        outputPackageDir = opd;
        done();
      });
    });

    it('should not fail', function () {
      expect(error).to.be(null);
    });

    it('should return the new output package directory', function () {
      expect(outputPackageDir).to.not.be(null);
    });

    // it('should map the document correctly', function () {
    //   ???
    // });
  });

});
