import color from 'color';

const argbRegexp = /^(#)([0-9A-F]{2})([0-9A-F]{6})$/;

function mapDocument(doc, options) {
  const result = {};
  result.version = '2';
  result.id = options.id;
  result.name = options.name;
  result.parts = mapParts(doc.work);
  result.annotations = mapVisualizationsToAnnotations(doc.visualizations);
  result.sounds = mapVisualizationsToSounds(doc.visualizations);
  return result;
}

function mapParts(work) {
  return work.parts.map(part => {
    const category = work.categories.find(cat => cat.id === part.categoryId);
    return {
      id: part.id,
      name: category ? category.name : '???',
      color: category ? toHexString(category.color) : '#FF0000',
      length: Number(part.length)
    };
  });
}

function toHexString(clr) {
  if (argbRegexp.test(clr)) {
    clr = clr.replace(argbRegexp, '$1$3');
  }
  return color(clr).hexString();
}

function mapVisualizationsToAnnotations(visualizations) {
  return visualizations
    .filter(vis => ['lyrics', 'harmonies', 'annotations'].indexOf(vis.type) !== -1)
    .map(vis => {
      return {
        id: vis.id,
        type: mapAnnotationTypeName(vis.type),
        values: vis[vis.type].parts.map(part => part.text)
      }
    });
}

function mapAnnotationTypeName(type) {
  switch (type) {
    case 'lyrics': return 'lyrics';
    case 'harmonies': return 'harmonies';
    default: return 'remarks';
  }
}

function mapVisualizationsToSounds(visualizations) {
  return visualizations
    .filter(vis => vis.type === 'sound')
    .map(vis => {
      return {
        uri: (vis.soundFile && vis.soundFile.uri) ? vis.soundFile.uri.replace(/^resource:\/\/\//, 'embedded://') : null
      };
    });
}

export default { mapDocument };
