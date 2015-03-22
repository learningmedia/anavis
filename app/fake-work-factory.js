import ko from "knockout";

function createFakePart(name, length, color) {
  return {
    name: ko.observable(name),
    length: ko.observable(length),
    color: ko.observable(color)
  };
}

function createFakeWork() {
  const work = {};
  work.parts = ko.observableArray([
    createFakePart("Verse", 200, "yellow"),
    createFakePart("Chorus", 200, "darkgreen"),
    createFakePart("Verse", 200, "yellow"),
    createFakePart("Chorus", 200, "darkgreen"),
    createFakePart("Instrumental", 100, "maroon"),
    createFakePart("Verse", 200, "yellow"),
    createFakePart("Chorus", 200, "darkgreen")
  ]);
  work.totalLength = ko.computed(() => work.parts().reduce((accu, item) => accu + item.length(), 0));
  work.currentPosition = ko.observable(0);
  return work;
}

export default { createFakeWork };
