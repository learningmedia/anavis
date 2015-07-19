import ko from "knockout";

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
    color: ko.observable("navy"),
    name: ko.observable("unbekannt"),
    sound: ko.observable()
  };
  work.parts = ko.observableArray();
  work.parts.push(part);
  works.push(work);
}

export default {
  works,
  create
};
