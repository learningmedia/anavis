import mapper from './old-to-new-format-mapper';
import input from './old-to-new-format-mapper.input.json';
import expectedOutput from './old-to-new-format-mapper.expected-output.json';

describe('old-to-new-format-mapper', function () {

  describe('when mapDocument is called', function () {

    it('should map the document correctly', function () {

      const options = {
        id: 'e8df0341-02fc-4f53-a899-f6ce05dc92d2',
        name: 'Werk, das aus dem ZIP-File kam'
      };
      const output = mapper.mapDocument(input, options);
      expect(output).toEqual(expectedOutput);

    });

  });

});
