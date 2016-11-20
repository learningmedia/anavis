const uuid = require('uuid');

function create() {
  return {
    version: '2',
    id: uuid.v4(),
    name: 'unbekannt',
    parts: [
      {
        id: uuid.v4(),
        name: 'unbekannt',
        color: '#000080',
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
