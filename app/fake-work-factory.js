import ko from "knockout";
import sound from "./sound";

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
  work.sound = sound.createViewModel("/audio/example.mp3");
  return work;
}

export default { createFakeWork };
