const fs = require('fs');
const path = require('path');
const color = require('color');
const mkdirp = require('mkdirp');
const utils = require('../utils');

const argbRegexp = /^(#)([0-9A-F]{2})([0-9A-F]{6})$/;

function mapDocument(doc, inputPackageDir, options, cb) {
  const outputPackageDir = utils.createTempDirectoryName();
  mkdirp.sync(outputPackageDir);

  const result = {};
  result.version = '2';
  result.id = options.id;
  result.name = options.name;
  result.parts = mapParts(doc.work);
  result.annotations = mapVisualizationsToAnnotations(doc.visualizations);
  result.sounds = mapVisualizationsToSounds(doc.visualizations, doc.resources, doc.rels, inputPackageDir, outputPackageDir);
  
  const docJson = JSON.stringify(result);
  const docFileName = path.normalize(path.join(outputPackageDir, 'anavis.json'));
  fs.writeFileSync(docFileName, docJson, 'utf8');
  // TODO: Copy sound files / delete old package dir, then call cb ...

  cb(null, outputPackageDir);
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

function mapVisualizationsToSounds(visualizations, resources, rels, inputPackageDir, outputPackageDir) {
  let results = [];
  let fileCopyActions = [];
  visualizations
    .filter(vis => vis.type === 'sound')
    .map(vis => {
      if (!vis.soundFile || !vis.soundFile.uri) {
        results.push({ path: null, embedded: false });
      } else if (vis.soundFile.uri.startsWith('file://')) {
        results.push({ path: makeFileUriAbsolute(vis.soundFile.uri), embedded: false });
      } else if (vis.soundFile.uri.startsWith('resource://')) {
        const soundResource = resources.find(res => res.visualizationId === vis.id);
        const relationshipId = soundResource.items[0].relationshipId;
        const relation = rels.find(rel => rel.id === relationshipId);
        const inputPath = path.normalize(relation.target);
        const outputPath = makeResourceUriAbsolute(vis.soundFile.uri, outputPackageDir);
        fileCopyActions.push({ source: inputPath, destination: outputPath })
        results.push({ path: outputPath, embedded: true });
      } else {
        throw new Error('Invalid sound file');
      }
    });

    for (const action of fileCopyActions) {
      copyFileSync(action.source, action.destination);
    }

    return results;
}

function makeFileUriAbsolute(fileUri) {
  return path.normalize(fileUri.replace(/^file:\/\/\//, ''));
}

function makeResourceUriAbsolute(resourceUri, absoluteTo) {
  return path.normalize(path.resolve(absoluteTo, resourceUri.replace(/^resource:\/\/\//, '')));
}

// copies a file synchronously:
function copyFileSync(srcFile, destFile) {
  const BUF_LENGTH = 64 * 1024;
  const buff = new Buffer(BUF_LENGTH);
  const fdr = fs.openSync(srcFile, 'r');
  const fdw = fs.openSync(destFile, 'w');
  let bytesRead = 1;
  let pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  fs.closeSync(fdw);
}

module.exports = { mapDocument };
