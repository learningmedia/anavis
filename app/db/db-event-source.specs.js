import eventSource from "db/db-event-source";
import Dexie from "dexie";

describe("Db Event Source", () => {

  let db;
  beforeEach(done => {
    db = new Dexie("TestDb");
    db.delete().then(() => {
      db.version(1).stores({works: "++id, cid, rank, data"});
      db.open();
    }).then(done, done);
  });

  afterEach(() => {
    db.close();
    db.delete();
  });

  describe("When we add 2 events and then remove them", () => {
    let es, events;
    beforeEach(done => {
      es = eventSource.create(db.works);
      const first = () => es.addEvent("340658043860", { eventName: "WorkCreated", parts: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "WorkChanged", parts: 3 });
      const clear = () => es.removeEvents("340658043860");
      const read = () => es.getEvents("340658043860");
      first().then(second).then(clear).then(read).then(x => events = x).then(done, done);
    });
    it("should contain 0 events", () => {
      expect(events.length).toBe(0);
    });
  });

  describe("When we add 2 events to the event source", () => {
    let es, events;
    beforeEach(done => {
      es = eventSource.create(db.works);
      const clear = () => es.removeEvents("340658043860");
      const first = () => es.addEvent("340658043860", { eventName: "WorkCreated", parts: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "WorkChanged", parts: 3 });
      const read = () => es.getEvents("340658043860");
      clear().then(first).then(second).then(read).then(x => events = x).then(done, done);
    });
    it("should contain 2 events", () => {
      expect(events.length).toBe(2);
    });
    it("should contain 2 events", () => {
      expect(events.length).toBe(2);
    });
    it("should contain the correct events", () => {
      expect(events[0]).toEqual({ eventName: "WorkCreated", parts: 4 });
      expect(events[1]).toEqual({ eventName: "WorkChanged", parts: 3 });
    });
  });

  describe("When we add 2 events and then reduce them", () => {
    let es, events;
    beforeEach(done => {
      es = eventSource.create(db.works);
      const clear = () => es.removeEvents("340658043860");
      const first = () => es.addEvent("340658043860", { eventName: "WorkCreated", parts: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "WorkChanged", parts: 3 });
      const reduce = () => es.reduce("340658043860", () => ({ eventName: "WorkCreated", parts: 3 }));
      const read = () => es.getEvents("340658043860");
      clear().then(first).then(second).then(reduce).then(read).then(x => events = x).then(done, done);
    });
    it("should contain 0 events", () => {
      expect(events.length).toBe(1);
    });
  });

  describe("When we add 2 events and then reduce them and the build function throw an exception", () => {
    let es, events;
    beforeEach(done => {
      es = eventSource.create(db.works);
      const clear = () => es.removeEvents("340658043860");
      const first = () => es.addEvent("340658043860", { eventName: "WorkCreated", parts: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "WorkChanged", parts: 3 });
      const reduce = () => es.reduce("340658043860", () => { throw new Error(); });
      const read = () => es.getEvents("340658043860");
      clear().then(first).then(second).then(reduce).catch(read).then(x => events = x).then(done, done);
    });
    it("should contain 2 events", () => {
      expect(events.length).toBe(2);
    });
  });

});
