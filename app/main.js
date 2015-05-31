import ko from "knockout";
import Dexie from "dexie";
import toolbar from "components/toolbar";
import workList from "work-list";

window.ko = ko;

// Register all components:
[toolbar].forEach(component => component.register());

const db = new Dexie("anavisdb");

db.delete().catch(console.error.bind(console)).then(createNewDb);

function createNewDb() {
  db.version(1).stores({
    works: "id, name",
    sounds: "id, name"
  });
  db.open();
  db.works.add({
    id: Date.now().toString(),
    name: "Test work",
    properties: [],
    parts: [
      { name: "Verse", length: 200, color: "yellow" },
      { name: "Chorus", length: 200, color: "darkgreen" },
      { name: "Verse", length: 200, color: "yellow" },
      { name: "Chorus", length: 200, color: "darkgreen" },
      { name: "Instrumental", length: 100, color: "maroon" },
      { name: "Verse", length: 200, color: "yellow" },
      { name: "Chorus", length: 200, color: "darkgreen" }
    ],
    soundId: undefined
  }).then(startApplication);
}

const vm = {};

function startApplication() {
  vm.works = workList;
  ko.applyBindings(vm);

  loadDatabaseWorks();
}

function loadDatabaseWorks() {
  db.works.toArray(works => {
    works.forEach(work => {
      const workVm = createWorkViewModelFromDbWork(work);
      vm.works.push(workVm);
    });
  }).catch(console.error.bind(console));
}

function createWorkViewModelFromDbWork(work) {
  return {
    id: ko.observable(work.id),
    name: ko.observable(work.name),
    properties: ko.observableArray(work.properties.map(prop => ({
      name: ko.observable(prop.name),
      value: ko.observable(prop.value)
    }))),
    parts: ko.observableArray(work.parts.map(part => ({
      name: ko.observable(part.name),
      length: ko.observable(part.length),
      color: ko.observable(part.color)
    }))),
    soundId: ko.observable(work.soundId),
    sound: undefined
  };
}
