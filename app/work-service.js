import ko from 'knockout';
import utils from './utils';

const works = ko.observableArray();

const getNextRank = (function () {
  let current = 0;
  return () => ++current;
})();

function create() {
  let work = {};

  let part = {
    id: ko.observable(getNextRank()),
    length: ko.observable(1024),
    color: ko.observable('navy'),
    name: ko.observable('unbekannt')
  };

  work.sound = ko.observable();
  work.parts = ko.observableArray();
  work.parts.push(part);

  work.onSoundDropped = function (files) {
    utils.blobToBuffer(files[0]).then(buffer => work.sound({ id: Date.now().toString(), buffer: buffer }));
  };

  works.push(work);
}

export default {
  works,
  create
};
