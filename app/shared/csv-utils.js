const { stringify: csvStringify } = require('csv-stringify/dist/cjs/sync.cjs');

function doc2Csv(doc) {
  const sumPartLengths = parts => parts.reduce((accu, part) => accu + part.length, 0);

  const totalLength = sumPartLengths(doc.parts);

  const segments = doc.parts.map((part, index) => ({
    startPosition: sumPartLengths(doc.parts.slice(0, index)) / totalLength,
    title: part.name,
    color: part.color,
    text: doc.annotations.map(annotation => annotation.values[index]).filter(text => text).join('\n\n') || ''
  }));

  return csvStringify(segments, { header: true });
}

module.exports = {
  doc2Csv
};
