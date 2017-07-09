const ColorHash = require('color-hash');
const autoColorizerMappings = require('./auto-colorizer-mappings.json');

const colorHash = new ColorHash();

function colorize(workVm) {
  workVm.parts().forEach(part => {
    part.color(mapPartNameToColor(part.name()));
  });
}

function mapPartNameToColor(name) {
  const lowerName = (name || '').toLowerCase();
  return autoColorizerMappings[lowerName] || colorHash.hex(lowerName);
}

module.exports = {
  colorize
};
