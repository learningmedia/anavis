import eventSource from "db/event-source";

describe("Event Source", () => {

  it("should be an object", () => expect(eventSource).toEqual(jasmine.any(Object)));

  describe("When we add 2 events and then remove them", () => {
    let es, events;
    beforeEach(done => {
      es = eventSource.create("cats");
      const first = () => es.addEvent("340658043860", { eventName: "CatCreated", legs: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "CatChanged", legs: 3 });
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
      es = eventSource.create("cats");
      const clear = () => es.removeEvents("340658043860");
      const first = () => es.addEvent("340658043860", { eventName: "CatCreated", legs: 4 });
      const second = () => es.addEvent("340658043860", { eventName: "CatChanged", legs: 3 });
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
      expect(events[0]).toEqual({ eventName: "CatCreated", legs: 4 });
      expect(events[1]).toEqual({ eventName: "CatChanged", legs: 3 });
    });
  });


});
