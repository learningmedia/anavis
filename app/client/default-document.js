const uuid = require('uuid');
const autoColorizerMappings = require('./actions/auto-colorizer-mappings.json');

function create() {
  return {
    version: '2',
    id: uuid.v4(),
    name: 'unbekannt',
    parts: [
      {
        id: uuid.v4(),
        name: 'unbekannt',
        color: autoColorizerMappings['unbekannt'],
        length: 1000
      }
    ],
    annotations: [],
    sounds: []
  };
}

module.exports = {
  create
};
